// 1.createElemWithText
function createElemWithText(element = "p", textContent = "", className) {
    const elem = document.createElement(element);
    elem.textContent = textContent;
    if (className) elem.className = className;
    return elem;
}

// 2.createSelectOptions
function createSelectOptions(users) {
    if (!users) return undefined;
    return users.map(user => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        return option;
    });
}

// 3.toggleCommentSection
function toggleCommentSection(postId) {
    if (!postId) return undefined;
    const section = document.querySelector(`section[data-post-id="${postId}"]`);
    if (section) section.classList.toggle("hide");
    return section;
}


// 4.toggleCommentButton
function toggleCommentButton(postId) {
    if (!postId) return undefined;
    const button = document.querySelector(`button[data-post-id="${postId}"]`);
    if (button) {
        button.textContent = button.textContent === "Show Comments" 
            ? "Hide Comments" 
            : "Show Comments";
    }
    return button;
}

// 5.deleteChildElements
function deleteChildElements(parentElement) {
    if (!(parentElement instanceof HTMLElement)) return undefined;
    while (parentElement.lastElementChild) {
        parentElement.removeChild(parentElement.lastElementChild);
    }
    return parentElement;
}

// 6.addButtonListeners
function addButtonListeners() {
    const buttons = document.querySelectorAll("main button");
    for (const button of buttons) {
        const postId = button.dataset.postId;
        if (postId) {
            button.addEventListener("click", event => toggleComments(event, postId));
        }
    }
    return buttons;
}


// 7.removeButtonListeners
function removeButtonListeners() {
    const buttons = document.querySelectorAll("main button");
    for (const button of buttons) {
        const postId = button.dataset.postId;
        if (postId) {
            button.removeEventListener("click", event => toggleComments(event, postId));
        }
    }
    return buttons;
}


// 8.createComments
function createComments(comments) {
    if (!comments) return undefined;
    const fragment = document.createDocumentFragment();
    for (const comment of comments) {
        const article = document.createElement("article");
        const h3 = createElemWithText("h3", comment.name);
        const p1 = createElemWithText("p", comment.body);
        const p2 = createElemWithText("p", `From: ${comment.email}`);
        article.append(h3, p1, p2);
        fragment.append(article);
    }
    return fragment;
}


// 9.populateSelectMenu
function populateSelectMenu(users) {
    if (!users) return undefined;
    const selectMenu = document.getElementById("selectMenu");
    const options = createSelectOptions(users);
    for (const option of options) {
        selectMenu.append(option);
    }
    return selectMenu;
}


// 10.getUsers
async function getUsers() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        return await response.json();
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

// 11.getUserPosts
async function getUserPosts(userId) {
    if (!userId) return undefined;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

// 12.getUser
async function getUser(userId) {
    if (!userId) return undefined;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

// 13.getPostComments
async function getPostComments(postId) {
    if (!postId) return undefined;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return undefined;
    }
}


// 14.displayComments
async function displayComments(postId) {
    if (!postId) return undefined;
    const section = document.createElement("section");
    section.dataset.postId = postId;
    section.classList.add("comments", "hide");
    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.append(fragment);
    return section;
}


// 15.createPosts
async function createPosts(posts) {
    if (!posts) return undefined;
    const fragment = document.createDocumentFragment();
    for (const post of posts) {
        const article = document.createElement("article");
        const h2 = createElemWithText("h2", post.title);
        const p1 = createElemWithText("p", post.body);
        const p2 = createElemWithText("p", `Post ID: ${post.id}`);
        const author = await getUser(post.userId);
        const p3 = createElemWithText("p", `Author: ${author.name} with ${author.company.name}`);
        const p4 = createElemWithText("p", author.company.catchPhrase);
        const button = createElemWithText("button", "Show Comments");
        button.dataset.postId = post.id;
        const section = await displayComments(post.id);
        article.append(h2, p1, p2, p3, p4, button, section);
        fragment.append(article);
    }
    return fragment;
}

// 16.displayPosts
async function displayPosts(posts) {
    const main = document.querySelector("main");
    if (!posts) {
        const defaultParagraph = createElemWithText("p", "Select an Employee to display their posts.", "default-text");
        main.append(defaultParagraph);
        return defaultParagraph;
    }
    const fragment = await createPosts(posts);
    main.append(fragment);
    return fragment;
}


// 17.toggleComments
function toggleComments(event, postId) {
    if (!event || !postId) return undefined;
    event.target.listener = true;
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    return [section, button];
}

// 18.refreshPosts
async function refreshPosts(posts) {
    if (!Array.isArray(posts) || posts.length === 0) return undefined; // Ensure posts is a valid array with data.
    const buttons = removeButtonListeners();
    const main = deleteChildElements(document.querySelector("main"));
    const fragment = await displayPosts(posts);
    const newButtons = addButtonListeners();

    return [buttons, main, fragment, newButtons];
}


// 19.selectMenuChangeEventHandler
async function selectMenuChangeEventHandler(event) {
    // 1. Check if the event exists and is of type "change".
    if (!event || event.type !== "change") return undefined;

    // 2. Define userId based on event.target.value or assign 1 if conditions are not met.
    const selectMenu = event?.target;
    const userId = !selectMenu?.value || selectMenu.value === "Employees" ? 1 : selectMenu.value;

    // 3. Disable the selectMenu if it exists.
    if (selectMenu) selectMenu.disabled = true;

    // 4. Fetch posts and refresh the posts on the page.
    const posts = await getUserPosts(userId);
    const refreshPostsArray = await refreshPosts(posts);

    // 5. Re-enable the selectMenu if it exists.
    if (selectMenu) selectMenu.disabled = false;

    // 6. Return the required array.
    return [userId, posts, refreshPostsArray];
}


// 20.initPage
async function initPage() {
    const users = await getUsers();
    const selectMenu = populateSelectMenu(users);
    return [users, selectMenu];
}

//21.initApp
function initApp() {
    initPage();
    const selectMenu = document.getElementById("selectMenu");
    selectMenu.addEventListener("change", selectMenuChangeEventHandler);
}
document.addEventListener("DOMContentLoaded", initApp);
