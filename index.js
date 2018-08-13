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
    img: "https://unidirectory.auckland.ac.nz/",
    vcard: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/vcard?u="
  }
};

const postComment = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc";

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

const navToggleButton = document.getElementById("toggle-nav-button");

navToggleButton.addEventListener("click", function() {
  document.getElementById("main-nav").classList.toggle("active");
  this.classList.toggle("active");
  [...this.children].forEach(child => {
    child.classList.toggle("active");
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

Object.entries(getUrls).forEach(stateNameAndUrl => {
  reqwest("GET", stateNameAndUrl[1].all, data =>
    renderDataToPage(JSON.parse(data), stateNameAndUrl[0])
  );
});

function renderCoursesToPage(data) {
  data = data.data;
  const target = document.getElementById(categoryEnum.courses);
  data
    .sort(
      (a, b) =>
        a.catalogNbr < b.catalogNbr ? -1 : a.catalogNbr > b.catalogNbr ? 1 : 0
    )
    .forEach(course =>
      target.appendChild(
        createCard({
          title: `${course.subject} ${course.catalogNbr}`,
          subtitle: course.titleLong,
          content: course.description
        })
      )
    );
}

function renderNewsToPage(data) {
  const target = document.getElementById(categoryEnum.news);
  data.forEach(newItem =>
    target.appendChild(
      createCard({
        title: newItem.titleField,
        subtitle: newItem.pubDateField,
        content: newItem.descriptionField,
        linkTo: newItem.linkField
      })
    )
  );
}

function renderNoticesToPage(data) {
  const target = document.getElementById(categoryEnum.notices);
  data.forEach(notice =>
    target.appendChild(
      createCard({
        title: notice.titleField,
        subtitle: notice.pubDateField,
        content: notice.descriptionField,
        linkTo: notice.linkField
      })
    )
  );
}

async function renderPeopleToPage(data) {
  const target = document.getElementById(categoryEnum.people);
  data = data.list;
  for (const person of data) {
    const details = JSON.parse(
      await reqwest(
        "GET",
        `${getUrls[categoryEnum.people].single}${person.profileUrl[0]}`
      )
    );
    target.appendChild(
      createProfileCard({
        name: `${person.title} ${person.names[0]}`,
        img: `${getUrls[categoryEnum.people].img}${details.image}`,
        role: person.jobtitles.join("</br>"),
        email: person.emailAddresses[0],
        phoneNum:
          details.phoneNumbers.length != 0 && details.phoneNumbers[0].phone
      })
    );
  }
}
