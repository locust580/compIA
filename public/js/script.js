const dropdownBtn = document.getElementsByClassName("dropdownHeadBtn");
const dropdownMenu = document.getElementById("dropdown");
const toggleArrow = document.getElementById("arrow");
const selectDropdownItem = document.getElementsByClassName("choice");

var value = "";

console.log(selectDropdownItem)

const toggleDropdown = function () {
  dropdownMenu.classList.toggle("show");
  toggleArrow.classList.toggle("arrow");
};

document.addEventListener('DOMContentLoaded', function(){

  const allButtons = document.querySelectorAll('.searchBtn');
  const searchBar = document.querySelector('.searchBar');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');

  for (var i = 0; i < allButtons.length; i++) {
    allButtons[i].addEventListener('click', function() {
      searchBar.style.visibility = 'visible';
      searchBar.classList.add('open');
      this.setAttribute('aria-expanded', 'true');
      searchInput.focus();
    });
  }

  searchClose.addEventListener('click', function() {
    searchBar.style.visibility = 'hidden';
    searchBar.classList.remove('open');
    this.setAttribute('aria-expanded', 'false');
  });

});



document.documentElement.addEventListener("click", function () {
  if (dropdownMenu.classList.contains("show")) {
    toggleDropdown();
  }
});

for (var i = 0; i < dropdownBtn.length; i++) {
  dropdownBtn[i].onclick = toggleDropdown();
  for (var j = 0; j < selectDropdownItem.length; j++) {
    selectDropdownItem[j].onclick = makeTag;
    console.log(selectDropdownItem[j].textContent);
  }
}




function makeTag() {
  value = this.text;
  interim = this.offsetParent.previousElementSibling.textContent;
  this.offsetParent.previousElementSibling.innerHTML = `${value}<i class=\"bx bx-chevron-down\" id=\"arrow\"></i>`;
  this.textContent = interim
};