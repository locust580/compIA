const dropdownBtn = document.getElementById("dropdownHeadBtn");
const dropdownMenu = document.getElementById("dropdown");
const toggleArrow = document.getElementById("arrow");

const toggleDropdown = function () {
  dropdownMenu.classList.toggle("show");
  toggleArrow.classList.toggle("arrow");
};

// WIP feature that greys out current page link in header

// document.addEventListener('DOMContentLoaded', function(){

//   const allButtons = document.querySelectorAll('.searchBtn');
//   const searchBar = document.querySelector('.searchBar');
//   const searchInput = document.getElementById('searchInput');
//   const searchClose = document.getElementById('searchClose');

//   for (var i = 0; i < allButtons.length; i++) {
//     allButtons[i].addEventListener('click', function() {
//       searchBar.style.visibility = 'visible';
//       searchBar.classList.add('open');
//       this.setAttribute('aria-expanded', 'true');
//       searchInput.focus();
//     });
//   }

//   searchClose.addEventListener('click', function() {
//     searchBar.style.visibility = 'hidden';
//     searchBar.classList.remove('open');
//     this.setAttribute('aria-expanded', 'false');
//   });

// });


dropdownBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  toggleDropdown();
});

document.documentElement.addEventListener("click", function () {
  if (dropdownMenu.classList.contains("show")) {
    toggleDropdown();
  }
});