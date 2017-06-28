var catList = new CatalogList();
document.addEventListener('DOMContentLoaded', function() {
  catList.afterReload();
  $("#Name").suggestions({
    token: "a4673c9942e4738c8bfdfdaad192edef690df398",
    type: "PARTY",
    count: 5,
    /* Вызывается, когда пользователь выбирает одну из подсказок */
    onSelect: function(suggestion) {
      console.log(suggestion);
      document.getElementById('INN').value = suggestion.data.inn;
      document.getElementById('Director').value = suggestion.data.management.name ;
    }
  });
});

function CatalogList() {
  this.ls = localStorage;
  if (localStorage.getItem('itemsOnPage') == null) {
    localStorage.setItem('itemsOnPage', 10);
  }
  if (localStorage.getItem('currentPage') == null) {
    localStorage.setItem('currentPage', 1);
  }
}
CatalogList.prototype.afterReload = function() {
  this.refreshList();
}
CatalogList.prototype.countItems = function() {

}
CatalogList.prototype.getData = function() {
  try {
    if (localStorage.getItem('data') != null)  {
      return JSON.parse(localStorage.getItem('data'));
    } else {
      return {};
    }
  } catch(e) {
    return {};
  }
}
CatalogList.prototype.getArray = function() {
  var data = this.getData(),
      arr = [];
  for (var key in data) {
    arr.push(data[key]);
  }
  return arr;
}
CatalogList.prototype.arrToObj = function(arr) {
  var obj = {},
      i;
  for (i = 0; i < arr.length; i++) {
    obj[arr[i]['INN']] = arr[i];
  }
  return obj;
}
CatalogList.prototype.addItem = function(form) {
  event.preventDefault();
  var formObj = checkForm(form),
      dataObj = {};
  if (formObj) {
    try {
      dataObj = this.getData();
    } catch(e) {

    }
    dataObj[formObj['INN']] = formObj;
    this.ls.setItem('data', JSON.stringify(dataObj));
    toggleModal();
    clearModalForm();
    this.refreshList();
  }
  // forEachKey(function(key) {
  //   console.log("key: " + key + "\n" + localStorage.getItem(key));
  // });
}
CatalogList.prototype.deleteItem = function(key) {
  var data = this.getData();
  delete data[key];
  localStorage.setItem('data', JSON.stringify(data));
  this.refreshList();
}
CatalogList.prototype.editItem = function(btn) {
  var tr = btn.parentNode.parentNode,
      els = tr.querySelectorAll('.editable'),
      inn = tr.getAttribute('value'),
      i,
      data;

  if (btn.innerHTML == "Редактировать") {
    btn.innerHTML = "Сохранить";
    toggleEditing(els);
  } else {
    btn.innerHTML = "Редактировать";
    toggleEditing(els);
    data = this.getData();
    if (data[els[0].innerHTML] == undefined) {
      delete data[inn];
    }
    data[els[0].innerHTML] = {INN: els[0].innerHTML, Name: els[1].innerHTML, Director: els[2].innerHTML};
    localStorage.setItem('data', JSON.stringify(data));
    this.refreshList();
  }

}
CatalogList.prototype.refreshList = function() {
  var data = this.getData(),
      str = "";
  for (var key in data) {
    str += "<tr value='" + data[key]['INN'] + "'><td class='editable'>" + data[key]['INN'] + "</td>"
    + "<td class='editable'>" + data[key]['Name'] + "</td>"
    + "<td class='editable'>" + data[key]['Director'] + "</td>"
    + "<td><span class='edit'>Редактировать</span></td>"
    + "<td><span class='delete'>Удалить</span></td>"
    + "</tr>";
  }
  document.getElementById('company-list').innerHTML = str;
  addHandlers();
}
CatalogList.prototype.sortList = function(item) {
  var data = this.getData(),
      field = item.getAttribute('value'),
      sortType = item.getAttribute('sorted'),
      reversed = item.getAttribute('reversed'),
      arr = this.getArray(),
      obj = {};

  if (sortType == 'digits') {
    arr.sort(function(a, b) {
      if (parseInt(a[field]) > parseInt(b[field])) {
        return 1;
      }
      if (parseInt(a[field]) < parseInt(b[field])) {
        return -1;
      }
      return 0;
    });
  } else if(sortType == "letters") {
    arr.sort(function(a, b) {
      return a[field].localeCompare(b[field]);
    });
  }

  if (reversed == "true") {
    arr.reverse();
    item.setAttribute('reversed', false);
  } else {
    item.setAttribute('reversed', true);
  }

  obj = this.arrToObj(arr);
  localStorage.setItem('data', JSON.stringify(obj));
  this.refreshList();
}

function forEachKey(callback) {
  for (var i = 0; i < localStorage.length; i++) {
    callback(localStorage.key(i));
  }
}
function toggleModal() {
  event.preventDefault();
  document.getElementById('modal').classList.toggle('active');
}
function clearModalForm() {
  document.getElementById('modal').querySelector('form').reset();
}
function checkForm(form) {
  var inpts = form.querySelectorAll('.form-el'),
      obj = {},
      error = false;

  [].forEach.call(inpts, function(input) {
    if (input.value.trim().length == 0) {
      error = true;
      return;
    }
    obj[input.name] = input.value;
  });

  if (error) {
    return false;
  } else {
    return obj;
  }
}
function addHandlers() {
  [].forEach.call(document.querySelectorAll('.delete'), function(item) {
    item.onclick = function() {
      var str = item.parentNode.parentNode.getAttribute('value');
      catList.deleteItem(str);
    }
  });

  [].forEach.call(document.querySelectorAll('.edit'), function(item) {
    item.onclick = function() {
      catList.editItem(item);
    }
  });

  [].forEach.call(document.querySelectorAll('.sort'), function(item) {
    item.onclick = function() {
      catList.sortList(item);
    }
  });
}
function toggleEditing(els) {
  for (i = 0; i < els.length; i++) {
    if (els[i].hasAttribute('contenteditable')) {
      els[i].removeAttribute('contenteditable');
    } else {
      els[i].setAttribute('contenteditable', 'true');
    }
    els[i].classList.toggle('editing');
  }
}
