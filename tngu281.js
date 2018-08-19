const categoryEnum = Object.freeze({
  home: "home",
  courses: "courses",
  news: "news",
  notices: "notices",
  people: "people",
  comments: "guest book"
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
const pageBody = document.querySelector("body");
const pageTitle = document.getElementById("title");
const pageContainer = document.getElementById("page-container");
const mainNavBar = document.getElementById("main-nav");
const navToggleButton = document.getElementById("toggle-nav-button");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
const modalCloseButton = document.getElementById("modal-close-button");
const spinner = document.getElementById("spinner");
let concurrencyCheck = 0;

const reqwest = (type, url, data = null, async = true) =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(type, url, async);
    request.setRequestHeader("Accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = function() {
      this.status >= 200 && this.status < 400
        ? resolve(this.response)
        : reject(this.response);
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
  className &&
    (Array.isArray(className)
      ? className.forEach(name => element.classList.add(name))
      : element.classList.add(className));
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
  pageTitle.innerText = pageName;
  navToggleButton.classList.remove("active");
  mainNavBar.classList.remove("active");
  applyToAll(".nav-item", e => e.classList.remove("active"));
  document.getElementById(`link-to-${pageName}`).classList.add("active");
  spinner.style.display = "block";
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
  if (thisLoadCheck == concurrencyCheck) {
    spinner.style.display = "none";
    pageContainer.classList = `${pageName}-page`;
    pageContainer.appendChild(page);
  }
};

const openModalWithData = data => {
  modalContent.innerHTML = "";
  modalContent.scrollTo(0, 0);
  typeof data == "string"
    ? (modalContent.innerHTML = data)
    : modalContent.appendChild(data);
  pageBody.style.overflowY = "hidden";
  modal.classList.add("active");
};

const closeModal = () => {
  pageBody.style.overflowY = "auto";
  modal.classList.remove("active");
};

const createCard = ({ title, subtitle, content = "N/A", linkTo, action }) => {
  const card = createHtmlElement({ className: "card-section" });
  const titleSection = createHtmlElement({
    className: "card-title"
  });
  if (linkTo) {
    content = `${content}</br><a href=${linkTo}>see more</a>`;
    titleSection.addEventListener("click", () => (window.location = linkTo));
    titleSection.classList.add("clickable");
  } else if (action) {
    titleSection.addEventListener("click", () => action());
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
        content: `&#x1F4F1; <a href="tel:${phoneNum}">${phoneNum}</a>`
      })
    );
  body.appendChild(
    createHtmlElement({
      type: "button",
      className: "vcard-button",
      content: "download vcard",
      additionalAttr: {
        onclick: `location.href="${getUrls[categoryEnum.people].vcard}${vcard}"`
      }
    })
  );
  card.appendChild(title);
  card.appendChild(body);
  return card;
};

const createTextInputBox = (
  inputBoxId,
  onSubmit,
  title,
  placeholder = "Type a message..."
) => {
  const inputWrapper = createHtmlElement({ type: "form", id: inputBoxId });
  const inputBody = createHtmlElement({
    className: "input-body",
    id: `${inputBoxId}-body`
  });
  const submitButton = createHtmlElement({
    type: "button",
    className: "input-box-submit",
    id: `${inputBoxId}-submit`,
    content: "Send"
  });
  const textField = createHtmlElement({
    type: "textarea",
    className: "input-box-textarea",
    id: `${inputBoxId}-textarea`,
    additionalAttr: { placeholder: placeholder }
  });
  submitButton.addEventListener("click", event => {
    event.preventDefault();
    onSubmit(textField.value.trim());
    textField.value = "";
  });
  if (title) {
    const titleWrapper = createHtmlElement({
      className: "input-title-wrapper",
      id: `${inputBoxId}-title-wrapper`
    });
    titleWrapper.appendChild(
      createHtmlElement({
        className: "input-box-title",
        id: `${inputBoxId}-title`,
        content: title
      })
    );
    inputWrapper.appendChild(titleWrapper);
  }
  inputBody.appendChild(textField);
  inputBody.appendChild(submitButton);
  inputWrapper.appendChild(inputBody);
  return inputWrapper;
};

const createTable = (body, header, tableId, columnId = header) => {
  const table = createHtmlElement({ type: "table", id: tableId });
  header &&
    table.appendChild(
      createHtmlElement({
        type: "thead",
        content: header
          .map(
            (th, i) =>
              `<th class="column-${columnId[i]
                .split(" ")
                .join("-")}">${th}</th>`
          )
          .join("")
      })
    );
  body.forEach(tr =>
    table.appendChild(
      createHtmlElement({
        type: "tr",
        content: tr
          .map(
            (td, i) =>
              `<td class="column-${columnId[i]
                .split(" ")
                .join("-")}">${td}</td>`
          )
          .join("")
      })
    )
  );
  return table;
};

// SECTION: Page renders

const renderHomePage = page => {
  page.appendChild(
    createHtmlElement({
      className: "big-title",
      type: "h1",
      content: "Department of Computer Science"
    })
  );
  page.appendChild(
    createHtmlElement({
      className: "big-subtitle",
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
          content: course.description,
          action: () => {
            spinner.style.display = "block";
            reqwest(
              "GET",
              `${getUrls[categoryEnum.courses].single}${course.catalogNbr}`
            ).then(response => {
              openModalWithData(
                createTable(
                  JSON.parse(response).data.map(e => [
                    e.classSection,
                    e.component,
                    e.meetingPatterns
                      .map(e => `${e.daysOfWeek} ${e.startTime} - ${e.endTime}`)
                      .join("</br>"),
                    e.enrolCap - e.enrolTotal > 0
                      ? `<span style="font-size: xx-large;">&#x1F389;</span`
                      : "closed"
                  ]),
                  ["class", "type", "time & dates", "status"],
                  "timetable"
                )
              );
              spinner.style.display = "none";
            });
          }
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
              details.phoneNumbers.length != 0 && details.phoneNumbers[0].phone,
            vcard: person.profileUrl[0]
          })
        )
      )
  );
  return Promise.all(promises);
};

const renderCommentsToPage = (data, page) => {
  page.appendChild(
    createTextInputBox(
      "comment-box",
      value => {
        const name = document.getElementById("user-name").value.trim();
        name &&
          value &&
          reqwest(
            "POST",
            `${getUrls[categoryEnum.comments].post}${name}`,
            JSON.stringify(value)
          )
            .then(response => JSON.parse(response))
            .then(data =>
              document.getElementById("comment-box").insertAdjacentHTML(
                "afterend",
                `<div class="comment">
                <div class="comment-author">${name}</div>
                <div class="comment-content">${data}</div>
                </div>`
              )
            );
      },
      "comment as <input id='user-name' required='required'>"
    )
  );
  [...data.querySelectorAll("p")]
    .map(comment => ({
      author: comment.querySelector("b").innerText,
      content: comment.querySelector("em").innerText
    }))
    .forEach(comment => {
      commentWrapper = createHtmlElement({ className: "comment" });
      commentWrapper.appendChild(
        createHtmlElement({
          className: "comment-author",
          content: comment.author
        })
      );
      commentWrapper.appendChild(
        createHtmlElement({
          className: "comment-content",
          content: comment.content
        })
      );
      page.appendChild(commentWrapper);
    });
};

// SECTION: initialize

// add event listener to menu and modal buttons
navToggleButton.addEventListener("click", function() {
  mainNavBar.classList.toggle("active")
    ? this.classList.add("active")
    : this.classList.remove("active");
});

// create navigation items
Object.values(categoryEnum).forEach(cat => {
  const button = createHtmlElement({
    className: "nav-item",
    id: `link-to-${cat}`,
    content: cat
  });
  button.addEventListener("click", function() {
    navToPage(cat);
  });
  mainNavBar.appendChild(button);
});

// set up home page
document.getElementById("link-to-home").classList.toggle("active");
pageTitle.innerText = "home";
renderHomePage(pageContainer);
