const categoryEnum = Object.freeze({
  home: "home",
  courses: "courses",
  news: "news",
  notices: "notices",
  people: "people"
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
  }
};

const postComment = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc";
const pageContainer = document.getElementById("page-container");
const mainNavBar = document.getElementById("main-nav");
const navToggleButton = document.getElementById("toggle-nav-button");

const reqwest = (type, url, callback) =>
  new Promise(resolve => {
    const request = new XMLHttpRequest();
    request.open(type, url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Accept", "application/json");
    request.onload = function() {
      if (this.status >= 200 && this.status < 400) {
        resolve(this.response);
        callback && callback(this.response);
      } else {
        console.log(this.response);
      }
    };
    request.send();
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
  content && (element.innerHTML = content);
  additionalAttr &&
    Object.entries(additionalAttr).forEach(attr =>
      element.setAttribute(attr[0], attr[1])
    );
  return element;
};

const navToPage = pageName => {
  applyToAll(".nav-button", e => e.classList.remove("active"));
  pageContainer.innerHTML = "";
  switch (pageName) {
    case categoryEnum.home:
      renderHomePage();
      break;
    case categoryEnum.courses:
      reqwest("GET", getUrls[pageName].all).then(data =>
        renderCoursesToPage(JSON.parse(data).data)
      );
      break;
    case categoryEnum.news:
      reqwest("GET", getUrls[pageName].all).then(data =>
        renderNewsToPage(JSON.parse(data))
      );
      break;
    case categoryEnum.notices:
      reqwest("GET", getUrls[pageName].all).then(data =>
        renderNoticesToPage(JSON.parse(data))
      );
      break;
    case categoryEnum.people:
      reqwest("GET", getUrls[pageName].all).then(data =>
        renderPeopleToPage(JSON.parse(data).list)
      );
      break;
  }
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

// add event listener to navigation toggle button
navToggleButton.addEventListener("click", function() {
  document.getElementById("main-nav").classList.toggle("active");
  this.classList.toggle("active");
  [...this.children].forEach(child => {
    child.classList.toggle("active");
  });
});

// add event listener to navigation items
Object.keys(categoryEnum).forEach(cat => {
  const button = createHtmlElement({
    className: "nav-item",
    content: cat.toLocaleUpperCase()
  });
  button.addEventListener("click", function() {
    applyToAll(".nav-item", e => e.classList.remove("active"));
    this.classList.add("active");
    navToPage(cat);
    navToggleButton.click();
  });
  mainNavBar.appendChild(button);
});

const renderHomePage = () => {};

const renderCoursesToPage = data =>
  data
    .sort(
      (a, b) =>
        a.catalogNbr < b.catalogNbr ? -1 : a.catalogNbr > b.catalogNbr ? 1 : 0
    )
    .forEach(course =>
      pageContainer.appendChild(
        createCard({
          title: `${course.subject} ${course.catalogNbr}`,
          subtitle: course.titleLong,
          content: course.description
        })
      )
    );

const renderNewsToPage = data =>
  data.forEach(newItem =>
    pageContainer.appendChild(
      createCard({
        title: newItem.titleField,
        subtitle: newItem.pubDateField,
        content: newItem.descriptionField,
        linkTo: newItem.linkField
      })
    )
  );

const renderNoticesToPage = data =>
  data.forEach(notice =>
    pageContainer.appendChild(
      createCard({
        title: notice.titleField,
        subtitle: notice.pubDateField,
        content: notice.descriptionField,
        linkTo: notice.linkField
      })
    )
  );

const renderPeopleToPage = data =>
  data.forEach(person => {
    reqwest(
      "GET",
      `${getUrls[categoryEnum.people].single}${person.profileUrl[0]}`
    )
      .then(response => JSON.parse(response))
      .then(details =>
        pageContainer.appendChild(
          createProfileCard({
            name: `${person.title ? person.title + " " : ""}${person.names[0]}`,
            img: `${getUrls[categoryEnum.people].img}${details.image}`,
            role: person.jobtitles.join("</br>"),
            email: person.emailAddresses[0],
            phoneNum:
              details.phoneNumbers.length != 0 && details.phoneNumbers[0].phone
          })
        )
      );
  });
