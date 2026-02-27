document.addEventListener('DOMContentLoaded', function () {

  var input = document.querySelector('#todo-input');
  var list = document.querySelector('#todo-list');
  var footer = document.querySelector('#footer');
  var countEl = document.querySelector('#todo-count');
  var clearBtn = document.querySelector('#clear-completed');
  var toggleAll = document.querySelector('#toggle-all');
  var filterLinks = document.querySelectorAll('.filters a');

  var STORAGE_KEY = 'todos_simple';
  var todos = loadTodos(); //incarcam task urile salvate
  var filter = getFilterFromHash(); //verificam pe ce filtru suntem

  syncUI();

  input.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var text = input.value.trim();
    if (!text) return;

    todos.push({
      id: Date.now().toString(),
      text: text,
      completed: false
    });

    input.value = ''; //curatam input ul 
    saveTodos(); //salvam
    syncUI(); //refacem ecranul
  });

  toggleAll.addEventListener('change', function () {  //cand bifam
    todos.forEach(function (t) {
      t.completed = toggleAll.checked;
    });
    saveTodos();
    syncUI();
  });

  clearBtn.addEventListener('click', function () {
    todos = todos.filter(function (t) {  //pastrez task urile nefinalizate
      return !t.completed;
    });
    saveTodos();
    syncUI();
  });

  window.addEventListener('hashchange', function () {
    filter = getFilterFromHash(); //verifica ce scrie in url dupa #
    syncUI();
  });

  function syncUI() {
    renderTodos();
    renderFooter();
    renderToggleAll();
    highlightFilter();
  }

  function renderTodos() {
    list.innerHTML = '';

    getVisibleTodos().forEach(function (todo) {
      var li = document.createElement('li');
      li.className = 'todo-item';
      if (todo.completed) li.classList.add('completed');

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-check';
      checkbox.checked = todo.completed;

      checkbox.onchange = function () {
        todo.completed = checkbox.checked;
        saveTodos();
        syncUI();
      };

      var span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;

      span.ondblclick = function () {
        startEdit(li, todo);
      };

      var destroy = document.createElement('button');
      destroy.className = 'destroy';
      destroy.textContent = '×';

      destroy.onclick = function () {
        todos = todos.filter(function (t) {
          return t.id !== todo.id;
        });
        saveTodos();
        syncUI();
      };

      li.append(checkbox, span, destroy);
      list.appendChild(li);
    });
  }

  function startEdit(li, todo) { //permite editarea unui task
    var inputEdit = document.createElement('input');
    inputEdit.className = 'edit-input';
    inputEdit.value = todo.text;

    li.replaceChild(inputEdit, li.querySelector('.todo-text'));
    inputEdit.focus();

    inputEdit.onkeydown = function (e) {
      if (e.key === 'Enter') finish();
      if (e.key === 'Escape') syncUI();
    };

    inputEdit.onblur = finish;

    function finish() {
      var text = inputEdit.value.trim();
      if (!text) {
        todos = todos.filter(function (t) {
          return t.id !== todo.id;
        });
      } else {
        todo.text = text;
      }
      saveTodos();
      syncUI();
    }
  }

  function renderFooter() {
    var active = todos.filter(function (t) {
      return !t.completed;
    }).length;
    //numar task urile care nu sunt finalizate

    footer.classList.toggle('hidden', todos.length === 0);
    countEl.textContent = active + ' items left';
    clearBtn.classList.toggle('hidden', active === todos.length);
  }

  function renderToggleAll() {
    var completed = todos.filter(function (t) {
      return t.completed;
    }).length;
    //numar cate task uri sunt finalizate

    toggleAll.checked = completed === todos.length && todos.length > 0;
    toggleAll.indeterminate = completed > 0 && completed < todos.length;
  }


  function highlightFilter() {
    filterLinks.forEach(function (link) {
      link.classList.toggle('selected', link.dataset.filter === filter);
    });
  }

  function getVisibleTodos() {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function getFilterFromHash() {
    if (location.hash === '#/active') return 'active';
    if (location.hash === '#/completed') return 'completed';
    return 'all';
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function loadTodos() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }

});
