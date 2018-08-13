const categoryEnum = Object.freeze({
  home: "home",
  courses: "courses",
  news: "news",
  notices: "notices",
  people: "people"
});

const getUrls = {
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
    img: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/img?id=",
    vcard: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/vcard?u="
  }
};

const postComment = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc";

const applyToAll = (query, func) =>
  [...document.querySelectorAll(query)].forEach(func);

const createHtmlElement = ({ type, id, className, content }) => {
  const element = document.createElement(type || "div");
  id && (element.id = id);
  className && (element.className = className);
  content && (element.innerHTML = content);
  return element;
};

const renderDataToPage = (data, pageName) => {
  switch (pageName) {
    case categoryEnum.courses:
      renderCoursesToPage(data);
      break;
    case categoryEnum.news:
      renderNewsToPage(data);
      break;
    case categoryEnum.notices:
      renderNoticesToPage(data);
      break;
    case categoryEnum.people:
      renderPeopleToPage(data);
      break;
  }
};

const navToPage = pageId => {
  applyToAll(".page", e => (e.style.display = "none"));
  applyToAll(".nav-button", e => e.classList.remove("active"));
  document.getElementById(pageId).style.display = "block";
};

const createCard = ({ title, subtitle, content = "N/A", linkTo }) => {
  const card = createHtmlElement({ type: "div", className: "card-section" });
  const titleSection = createHtmlElement({
    type: "div",
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
      type: "div",
      className: "card-content",
      content: content
    })
  );
  return card;
};

const navToggleButton = document.getElementById("toggle-nav-button");

navToggleButton.addEventListener("click", function() {
  document.getElementById("main-nav").classList.toggle("open");
  [...this.children].forEach(child => {
    child.classList.toggle("open");
  });
});

// add event listener to nav buttons
[...document.getElementsByClassName("nav-item")].forEach(button =>
  button.addEventListener("click", function() {
    applyToAll(".nav-item", e => e.classList.remove("active"));
    this.classList.add("active");
    navToPage(this.id.slice(this.id.lastIndexOf("-") + 1));
    navToggleButton.click();
  })
);

Object.entries(getUrls).forEach(stateNameAndUrl => {
  const request = new XMLHttpRequest();
  request.open("GET", stateNameAndUrl[1].all, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Accept", "application/json");
  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      renderDataToPage(JSON.parse(this.response), stateNameAndUrl[0]);
    } else {
      console.log(this.response);
    }
  };
  request.send();
});

function renderCoursesToPage(data) {
  data = data.data;
  const target = document.getElementById(categoryEnum.courses);
  data.forEach(course => {
    target.appendChild(
      createCard({
        title: `${course.subject} ${course.catalogNbr}`,
        subtitle: course.titleLong,
        content: course.description
      })
    );
  });
}

function renderNewsToPage(data) {
  const target = document.getElementById(categoryEnum.news);
  data.forEach(newItem => {
    target.appendChild(
      createCard({
        title: newItem.titleField,
        subtitle: newItem.pubDateField,
        content: newItem.descriptionField,
        linkTo: newItem.linkField
      })
    );
  });
}

function renderNoticesToPage(data) {
  const target = document.getElementById(categoryEnum.notices);
  data.forEach(notice => {
    target.appendChild(
      createCard({
        title: notice.titleField,
        subtitle: notice.pubDateField,
        content: notice.descriptionField,
        linkTo: notice.linkField
      })
    );
  });
}

function renderPeopleToPage(data) {
  console.log(data);
  document.getElementById(categoryEnum.people).innerText = data;
}
