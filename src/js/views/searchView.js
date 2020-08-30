import { element } from './base';

export const getInput = () => element.searchInput.value;

export const clearInput = () => element.searchInput.value = '';

export const clearResult = () => {
    element.searchResList.innerHTML = '';
    element.searchResPage.innerHTML = '';
}

const limitRecipeTitle = (title, limit = 18) => {
    const newTitle = [];
    let count = 0;
    title.split(' ').forEach(el => {
        count += el.length;
        if (count <= limit) newTitle.push(el);
    });

    return newTitle.join(' ').concat('...');
};

const renderRecipe = (recipe) => {
    const markup = `
    <li>
    <a class="results__link" href="#${recipe.recipe_id}">
        <figure class="results__fig">
            <img src="${recipe.image_url}" alt="${limitRecipeTitle(recipe.title)}">
        </figure>
        <div class="results__data">
            <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
            <p class="results__author">${recipe.publisher}</p>
        </div>
    </a>
    </li>
    `;

    element.searchResList.insertAdjacentHTML('beforeend', markup);
}

const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto="${type === 'prev' ? (page - 1) : (page + 1)}" >
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
        <span>Page ${type === 'prev' ? (page - 1) : (page + 1)}</span>
    </button>
`;

const renderButtons = (page, numOfRecipes, resPerPage) => {
    const pages = Math.ceil(numOfRecipes / resPerPage);

    let button;
    if (page === 1) {
        //Render right button
        button = createButton(page, 'next');
    } else if (page === pages) {
        //Render left button
        button = createButton(page, 'prev');
    } else if (page > 1 && page < pages) {
        //Render two button
        button = `
           ${createButton(page, 'prev')}
           ${createButton(page, 'next')}
        `;
    }

    element.searchResPage.insertAdjacentHTML('afterbegin', button);

}

export const renderResult = (result, page = 1, resPerPage = 10) => {
    //Render result of current page
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;
    result.slice(start, end).forEach(renderRecipe);
    //Render pagination buttons
    renderButtons(page, result.length, resPerPage);
}

export const highlightSelected = (id) => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    if(resultsArr){
        resultsArr.forEach(el => {
            el.classList.remove('results__link--active');
        });
        try{
            document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
        }catch(err){
            console.log('Recipe was not in left list');
        }
    }
}


// publisher: "101 Cookbooks"
// title: "Best Pizza Dough Ever"
// source_url: "http://www.101cookbooks.com/archives/001199.html"
// recipe_id: "47746"
// image_url: "http://forkify-api.herokuapp.com/images/best_pizza_dough_recipe1b20.jpg"
// social_rank: 100
// publisher_url: "http://www.101cookbooks.com"

