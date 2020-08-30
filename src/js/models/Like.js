export default class Like {
    constructor() {
        this.likes = [];
    }

    addLike(id, title, author, img) {
        const like = { id, title, author, img };
        this.likes.push(like);

        //Storing in local storage
        this.persistData();
        return like;
    }

    deleteLike(id) {
        const index = this.likes.findIndex(cur => cur.id === id);
        this.likes.splice(index, 1);

        //Storing in local storage
        this.persistData();
    }

    isLiked(id) {
        return this.likes.findIndex(cur => cur.id === id) !== -1;
    }

    getNumLikes() {
        return this.likes.length;
    }

    persistData() {
        localStorage.setItem('likes', JSON.stringify(this.likes));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes'));

        //Restoring like from local storage
        if (storage) this.likes = storage;
    }
}