const categoryEnum = Object.freeze({
  home: "home",
  courses: "courses",
  news: "news",
  notices: "notices",
  people: "people",
  comments: "comments"
});

const getUrls = {
  [categoryEnum.home]: {
    all: null
  },
  [categoryEnum.courses]: {
    all: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/courses",
    single: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/course?c="
  },
  [categoryEnum.news]: {
    all: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/news"
  },
  [categoryEnum.notices]: {
    all: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/notices"
  },
  [categoryEnum.people]: {
    all: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/people",
    single: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/person?u=",
    img: "https://unidirectory.auckland.ac.nz/",
    vcard: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/vcard?u="
  },
  [categoryEnum.comments]: {
    all: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/htmlcomments",
    post:
      "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/comment?name="
  }
};

const parser = new DOMParser();
const postComment = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc";
const pageTitle = document.getElementById("title");
const pageContainer = document.getElementById("page-container");
const mainNavBar = document.getElementById("main-nav");
const navToggleButton = document.getElementById("toggle-nav-button");
const spinner = document.getElementById("spinner");
let concurrencyCheck = 0;

const reqwest = (type, url, data = null, async = true) =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(type, url, async);
    request.setRequestHeader("Accept", "application/json");
    request.onload = function() {
      if (this.status >= 200 && this.status < 400) {
        resolve(this.response);
      } else {
        reject(this.response);
      }
    };
    request.send(data);
  });

const applyToAll = (query, func) =>
  [...document.querySelectorAll(query)].forEach(func);

const createHtmlElement = ({
  type = "div",
  id,
  className,
  content,
  additionalAttr
}) => {
  const element = document.createElement(type);
  id && (element.id = id);
  className && Array.isArray(className)
    ? className.forEach(name => element.classList.add(name))
    : element.classList.add(className);
  switch (typeof content) {
    case "string":
      element.innerHTML = content;
      break;
    case "object":
      element.appendChild(content);
      break;
  }
  additionalAttr &&
    Object.entries(additionalAttr).forEach(attr =>
      element.setAttribute(attr[0], attr[1])
    );
  return element;
};

const navToPage = async pageName => {
  const page = document.createDocumentFragment();
  const thisLoadCheck = ++concurrencyCheck;
  let data;
  pageContainer.innerHTML = "";
  title.innerText = pageName;
  spinner.style.display = "block";
  applyToAll(".nav-button", e => e.classList.remove("active"));
  switch (pageName) {
    case categoryEnum.home:
      renderHomePage(page);
      break;
    case categoryEnum.courses:
      data = await reqwest("GET", getUrls[pageName].all);
      renderCoursesToPage(JSON.parse(data).data, page);
      break;
    case categoryEnum.news:
      data = await reqwest("GET", getUrls[pageName].all);
      renderNewsToPage(JSON.parse(data), page);
      break;
    case categoryEnum.notices:
      data = await reqwest("GET", getUrls[pageName].all);
      renderNoticesToPage(JSON.parse(data), page);
      break;
    case categoryEnum.people:
      data = await reqwest("GET", getUrls[pageName].all);
      await renderPeopleToPage(JSON.parse(data).list, page);
      break;
    case categoryEnum.comments:
      data = await reqwest("GET", getUrls[pageName].all);
      data = parser.parseFromString(data, "text/html");
      renderCommentsToPage(data, page);
      break;
  }
  thisLoadCheck == concurrencyCheck &&
    (spinner.style.display = "none") &&
    pageContainer.appendChild(page);
};

const createCard = ({ title, subtitle, content = "N/A", linkTo }) => {
  const card = createHtmlElement({ className: "card-section" });
  const titleSection = createHtmlElement({
    className: "card-title"
  });
  if (linkTo) {
    content = `${content}</br><a href=${linkTo}>see more</a>`;
    titleSection.addEventListener("click", () => (window.location = linkTo));
    titleSection.classList.add("clickable");
  }
  titleSection.appendChild(
    createHtmlElement({
      type: "h3",
      content: title
    })
  );
  subtitle &&
    subtitle.length != 1 &&
    titleSection.appendChild(
      createHtmlElement({
        type: "h5",
        content: subtitle
      })
    );
  card.appendChild(titleSection);
  card.appendChild(
    createHtmlElement({
      className: "card-content",
      content: content
    })
  );
  return card;
};

const createProfileCard = ({ name, img, role, email, phoneNum, vcard }) => {
  const card = createHtmlElement({ className: ["card-section", "profile"] });
  const title = createHtmlElement({ className: "profile-title" });
  const body = createHtmlElement({ className: "profile-content" });
  title.appendChild(
    createHtmlElement({
      type: "img",
      className: "ava",
      additionalAttr: { src: img }
    })
  );
  title.appendChild(createHtmlElement({ type: "h3", content: name }));
  title.appendChild(createHtmlElement({ type: "h6", content: role }));
  email &&
    body.appendChild(
      createHtmlElement({
        className: "profile-email",
        content: `&#x2709; <a href="mailto:${email}">${email}</a>`
      })
    );
  phoneNum &&
    body.appendChild(
      createHtmlElement({
        className: "profile-phone",
        content: `&#9742; <a href="tel:${phoneNum}">${phoneNum}</a>`
      })
    );
  body.appendChild(
    createHtmlElement({
      type: "form",
      additionalAttr: { action: vcard }
    }).appendChild(
      createHtmlElement({
        type: "button",
        className: "vcard-button",
        content: "download vcard"
      })
    )
  );
  card.appendChild(title);
  card.appendChild(body);
  return card;
};

const renderHomePage = page => {
  page.appendChild(
    createHtmlElement({
      type: "h1",
      content: "Welcome to the Department of Computer Science"
    })
  );
  page.appendChild(
    createHtmlElement({
      type: "h3",
      content:
        "Welcome to New Zealand's leading computer science department. We pride ourselves on the excellence of our staff and our students."
    })
  );
};

const renderCoursesToPage = (data, page) =>
  data
    .sort(
      (a, b) =>
        a.catalogNbr < b.catalogNbr ? -1 : a.catalogNbr > b.catalogNbr ? 1 : 0
    )
    .forEach(course =>
      page.appendChild(
        createCard({
          title: `${course.subject} ${course.catalogNbr}`,
          subtitle: course.titleLong,
          content: course.description
        })
      )
    );

const renderNewsToPage = (data, page) =>
  data.forEach(newItem =>
    page.appendChild(
      createCard({
        title: newItem.titleField,
        subtitle: newItem.pubDateField,
        content: newItem.descriptionField,
        linkTo: newItem.linkField
      })
    )
  );

const renderNoticesToPage = (data, page) =>
  data.forEach(notice =>
    page.appendChild(
      createCard({
        title: notice.titleField,
        subtitle: notice.pubDateField,
        content: notice.descriptionField,
        linkTo: notice.linkField
      })
    )
  );

const renderPeopleToPage = (data, page) => {
  const promises = data.map(person =>
    reqwest(
      "GET",
      `${getUrls[categoryEnum.people].single}${person.profileUrl[0]}`
    )
      .then(response => JSON.parse(response))
      .then(details =>
        page.appendChild(
          createProfileCard({
            name: `${person.title ? person.title + " " : ""}${person.names[0]}`,
            img: `${getUrls[categoryEnum.people].img}${details.image}`,
            role: person.jobtitles.join("</br>"),
            email: person.emailAddresses[0],
            phoneNum:
              details.phoneNumbers.length != 0 && details.phoneNumbers[0].phone
          })
        )
      )
  );
  return Promise.all(promises);
};

const renderCommentsToPage = (data, page) => {
  [...data.querySelectorAll("p")]
    .map(comment => ({
      author: comment.querySelector("b"),
      message: comment.querySelector("em")
    }))
    .forEach(comment => {
      page.appendChild(
        createHtmlElement({ type: "h3", content: comment.author })
      );
      page.appendChild(
        createHtmlElement({ type: "h5", content: comment.message })
      );
    });
};

// add event listener to navigation toggle button
navToggleButton.addEventListener("click", function() {
  mainNavBar.classList.toggle("active");
  this.classList.toggle("active");
  [...this.children].forEach(child => {
    child.classList.toggle("active");
  });
});

// add event listener to navigation items
Object.keys(categoryEnum).forEach(cat => {
  const button = createHtmlElement({
    className: "nav-item",
    id: `link-to-${cat}`,
    content: cat
  });
  button.addEventListener("click", function() {
    applyToAll(".nav-item", e => e.classList.remove("active"));
    this.classList.add("active");
    navToPage(cat);
    navToggleButton.click();
  });
  mainNavBar.appendChild(button);
});

document.getElementById("link-to-home").classList.toggle("active");
title.innerText = "home";
renderHomePage(pageContainer);
