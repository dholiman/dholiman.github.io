const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		console.log(entry)
		if (entry.isIntersecting) {
			entry.target.classList.add('in-view');
		} // else {
		//	entry.target.classList.remove('in-view')
		//}
	});
});

const hiddenElements = document.querySelectorAll('.animate');
hiddenElements.forEach((el) => observer.observe(el));

document.addEventListener('click', function (event) {
    const burgerInput = document.getElementById('burger');
    const navContainer = document.querySelector('nav .container');

    // Check if the click is outside the nav container and the input is checked
    if (!navContainer.contains(event.target) && burgerInput.checked) {
        burgerInput.checked = false; // Toggle the input off
    }
});
