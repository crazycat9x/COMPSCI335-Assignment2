function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

function getStaff() {
  const uri = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/people";
  const xhr = new XMLHttpRequest();
  xhr.open("GET", uri, true);
  xhr.onload = () => {
    const resp = JSON.parse(xhr.responseText);
    presentStaff(resp.list);
  };
  xhr.send(null);
}

function getPhone(uid) {
  return new Promise(resolve => {
    const uri = `http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/person?u=${uid}`;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", uri, true);
    xhr.onload = function() {
      resolve(xhr.responseText);
    };
    xhr.send(null);
  });
}

async function presentStaff(listing) {
  var tableContent = "<tr class='staffTable'><td></td><td><td/></tr>\n";
  const addRecord = async record => {
    let picture = "https://unidirectory.auckland.ac.nz/people/imageraw/{PersonID}/{Imageid}/small";
    const name = (record.title ? record.title + " " : "") + record.names[0];
    let pictureLink = picture
      .replace("{PersonID}", record.profileUrl[0])
      .replace("{Imageid}", record.imageId ? record.imageId : 0);
    const email = `<a href='mailto:${record.emailAddresses[0]}'>${record.emailAddresses[0]}</a>`;
    const phone = await getPhone(record.profileUrl[1]);
    console.log(phone);
    tableContent += `<td><img src="${pictureLink}" height='50' width='50'></td> <td>${name}</br>${record.jobtitles[0]}</br>${email}</br>${phone}</td></tr>\n`;
  };
  for (something of listing) {
    await addRecord(something)
  }
  document.getElementById("staffTab").innerHTML = tableContent;
}

function sortByNumber(x, y) {
  return x.catalogNbr > y.catalogNbr;
}

function getCourses() {
  const uri = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/courses";
  const xhr = new XMLHttpRequest();
  xhr.open("GET", uri, true);
  xhr.onload = () => {
    const resp = JSON.parse(xhr.responseText);
    presentCourses(resp.data.sort(sortByNumber));
  };
  xhr.send(null);
}

function getSchedule(cid) {
  let uri = `http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/course?c=${cid}`;
  // uri.replace("{CID}", cid);
  console.log(uri);
  const xhr = new XMLHttpRequest();
  xhr.open("GET", uri, true);
  xhr.onload = () => {
    const resp = JSON.parse(xhr.responseText);
  };
  xhr.send(null);
}

function presentCourses(listing) {
  var tableContent = "<tr class='courseTable'><td></td></tr>\n";
  const addRecord = record => {
    tableContent +=
      "<td><b>" +
      record.subject +
      " " +
      record.catalogNbr +
      "</b></br>" +
      record.titleLong +
      " </br>" +
      (record.description ? record.description : "") +
      "</td></tr>\n";
  };
  listing.forEach(addRecord);
  document.getElementById("coursesTab").innerHTML = tableContent;
}

function getNews() {
  let uri = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/news";
  const xhr = new XMLHttpRequest();
  xhr.open("GET", uri, true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.onload = function() {
    const resp = JSON.parse(xhr.responseText);
    presentNews(resp);
  };
  xhr.send(null);
}

function presentNews(listing) {
  var tableContent = "<tr class='courseTable'><td></td></tr>\n";
  const addRecord = record => {
    tableContent +=
      "<td> <b><a href=" +
      record.linkField +
      ">" +
      record.titleField +
      "</a></b> </br>" +
      record.pubDateField +
      "</br>" +
      record.descriptionField +
      "</td></tr>\n";
  };
  listing.forEach(addRecord);
  document.getElementById("newsTab").innerHTML = tableContent;
}

function getNotices() {
  let uri = "http://redsox.uoa.auckland.ac.nz/ups/UniProxService.svc/notices";
  const xhr = new XMLHttpRequest();
  xhr.open("GET", uri, true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.onload = function() {
    const resp = JSON.parse(xhr.responseText);
    presentNotices(resp);
  };
  xhr.send(null);
}

function presentNotices(listing) {
  var tableContent = "<tr class='courseTable'><td></td></tr>\n";
  const addRecord = record => {
    tableContent +=
      "<td> <b><a href=" +
      record.linkField +
      ">" +
      record.titleField +
      "</a></b> </br>" +
      record.pubDateField +
      "</br>" +
      record.descriptionField +
      "</td></tr>\n";
  };
  listing.forEach(addRecord);
  document.getElementById("noticesTab").innerHTML = tableContent;
}

let currentTab = "";
function showHome() {
  if (currentTab != "TabHome") {
    currentTab = "TabHome";
    showNoTabs();
    document.getElementById("TabHome").style.backgroundColor = "lightBlue";
    document.getElementById("SectionHome").style.display = "inline";
  }
}

function showCourses() {
  if (currentTab != "TabCourses") {
    currentTab = "TabCourses";
    showNoTabs();
    document.getElementById("TabCourses").style.backgroundColor = "lightBlue";
    document.getElementById("SectionCourses").style.display = "inline";
    getCourses();
  }
}

function showPeople() {
  if (currentTab != "TabPeople") {
    currentTab = "TabPeople";
    showNoTabs();
    document.getElementById("TabPeople").style.backgroundColor = "lightBlue";
    document.getElementById("SectionPeople").style.display = "inline";
    getStaff();
  }
}

function showNews() {
  if (currentTab != "TabNews") {
    currentTab = "TabNews";
    showNoTabs();
    document.getElementById("TabNews").style.backgroundColor = "lightBlue";
    document.getElementById("SectionNews").style.display = "inline";
    getNews();
  }
}

function showNotices() {
  if (currentTab != "TabNotices") {
    currentTab = "TabNotices";
    showNoTabs();
    document.getElementById("TabNotices").style.backgroundColor = "lightBlue";
    document.getElementById("SectionNotices").style.display = "inline";
    getNotices();
  }
}

function showGuestBook() {
  if (currentTab != "TabGuestBook") {
    currentTab = "TabGuestBook";
    showNoTabs();
    document.getElementById("TabGuestBook").style.backgroundColor = "lightBlue";
    document.getElementById("SectionGuestBook").style.display = "inline";
  }
}

function showNoTabs() {
  document.getElementById("TabHome").style.backgroundColor = "transparent";
  document.getElementById("TabCourses").style.backgroundColor = "transparent";
  document.getElementById("TabPeople").style.backgroundColor = "transparent";
  document.getElementById("TabNews").style.backgroundColor = "transparent";
  document.getElementById("TabNotices").style.backgroundColor = "transparent";
  document.getElementById("TabGuestBook").style.backgroundColor = "transparent";

  document.getElementById("SectionHome").style.display = "none";
  document.getElementById("SectionCourses").style.display = "none";
  document.getElementById("SectionPeople").style.display = "none";
  document.getElementById("SectionNews").style.display = "none";
  document.getElementById("SectionNotices").style.display = "none";
  document.getElementById("SectionGuestBook").style.display = "none";
}

window.onload = function() {
  showHome();
};
