import Search from './models/Search';
import * as searchView from './views/searchView';

import Recipe from './models/Recipe';
import * as recipeView from './views/recipeView';

import List from './models/List';
import * as listView from './views/listView';

import Like from './models/Like';
import * as likeView from './views/likeView';

import { element, renderLoader, clearLoader } from './views/base';

/**
 * GLOBAL STATE OF THE APP
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipe
 */

const state = {};

/**
 * CONTROL SEARCH
 */

const controlSearch = async () => {
    //1, Get query from view
    const query = searchView.getInput();
    if (query) {
        //2, New search object and add to state
        state.search = new Search(query);
        //3, Prepare UI for result
        renderLoader(element.searchRes);
        searchView.clearInput();
        searchView.clearResult();
        try {
            //4, Search for recipes
            await state.search.getResults();
            //5, Render result on UI
            clearLoader();
            searchView.renderResult(state.search.result);
        } catch (err) {
            clearLoader();
            alert('Something wrong with the search...');
        }
    }
}

element.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    controlSearch();
});

element.searchResPage.addEventListener('click', (e) => {
    const page = parseInt(e.target.closest('.btn-inline').dataset.goto);

    if (page) {
        searchView.clearResult();
        searchView.renderResult(state.search.result, page);
    }
});

/**
 * CONTROL RECIPE
 */
const controlRecipe = async () => {
    //Get id
    const id = window.location.hash.replace('#', '');
    if (id) {
        //Prepare UI for change
        recipeView.clearRecipe();
        renderLoader(element.recipe);
        //Highlight selected item
        if (state.search) {
            searchView.highlightSelected(id);
        }
        //Create new recipe
        state.recipe = new Recipe(id);
        try {
            //Get recipe data and parse ingredient
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            //Calculate serving and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.like.isLiked(id));
        } catch (err) {
            clearLoader();
            alert('Error processing recipe');
            console.log(err);
        }
    }
}

['hashchange', 'load'].forEach(event => addEventListener(event, controlRecipe));

/**
 * CONTROL LIST
 */

const controlList = () => {
    //Create a new list IF there in none yet
    if (!state.list) state.list = new List();
    //if it has a list, delete the old list
    element.shopping.innerHTML = '';
    //Add each ingredient to the list (Data structute and UI)
    state.recipe.ingredients.forEach(cur => {
        const item = state.list.addItem(cur.count, cur.unit, cur.ingredient);
        listView.renderItem(item);
    });
}

//Handle delete and update list item
element.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').getAttribute('data-itemid');
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //Delete item in data structure
        state.list.deleteItem(id);
        //Delete item in UI
        const item = e.target.closest('.shopping__item');
        listView.deleteItem(item);
    } else if (e.target.matches('.shopping__count-value, .shopping__count-value *')) {
        // Update
        const value = parseFloat(e.target.value, 10);
        state.list.updateCount(id, value);
    }
});

/**
 * LIKE CONTROLLER
 */
const controlLike = () => {
    if (!state.like) state.like = new Like();
    const currentID = state.recipe.id;
    const isLiked = state.like.isLiked(currentID);
    if (!isLiked) {
        //Add like to the state
        const newLike = state.like.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //Toggle the like button
        likeView.toggleLikeBtn(true);
        //Add like to the UI list
        likeView.renderLike(newLike);
    } else {
        //Remove like from state
        state.like.deleteLike(currentID);
        //Toggle the like button
        likeView.toggleLikeBtn(false);
        //Remove like to the UI list
        likeView.deleteLike(currentID);
    }
    //Toggle like menu btn
    likeView.toggleLikeMenu(state.like.getNumLikes());
}

//Restore liked recipe on page load
window.addEventListener('load', () => {
    state.like = new Like();
    //Restore Like
    state.like.readStorage();
    //Toggle like menu btn
    likeView.toggleLikeMenu(state.like.getNumLikes());
    //Render the existing like
    state.like.likes.forEach(cur => likeView.renderLike(cur));
});


// Handling recipe button clicks
element.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-increase, .btn-increase *')) {
        //Button increase was clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Button decrease was clickeds
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Control list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Control love
        controlLike();
    }
});

