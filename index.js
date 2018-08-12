const requestEnum = {
  courses: "courses",
  news: "news",
  notices: "notices",
  people: "people"
};

const getUrls = {
  [requestEnum.courses]: {
    all: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/courses",
    single: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/course?c="
  },
  [requestEnum.news]: {
    all: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/news"
  },
  [requestEnum.notices]: {
    all: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/notices"
  },
  [requestEnum.people]: {
    all: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/people",
    single: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/person?u=",
    vcard: "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/vcard?u="
  }
};

const postComment = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc";

const setGlobalState = (stateName, data) => {
  switch (stateName) {
    case requestEnum.courses:
      fireOnCoursesStateChange(data);
      break;
    case requestEnum.news:
      fireOnNewsStateChange(data);
      break;
    case requestEnum.notices:
      fireOnNoticesStateChange(data);
      break;
    case requestEnum.people:
      fireOnPeopleStateChange(data);
      break;
  }
};

Object.entries(getUrls).forEach(stateNameAndUrl => {
  const request = new XMLHttpRequest();
  request.open("GET", stateNameAndUrl[1].all, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Accept", "application/json");
  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      setGlobalState(stateNameAndUrl[0], JSON.parse(this.response));
    } else {
      console.log(this.response);
    }
  };
  request.send();
});

function fireOnCoursesStateChange(data) {
  console.log(data);
}
function fireOnNewsStateChange(data) {
  console.log(data);
}
function fireOnNoticesStateChange(data) {
  console.log(data);
}
function fireOnPeopleStateChange(data) {
  console.log(data);
}
