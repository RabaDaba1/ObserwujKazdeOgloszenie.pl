const formInputs = Array.from(document.querySelectorAll('.form-field input'));

formInputs.forEach(input => {
	input.addEventListener("focus", function() {
		this.classList.add('focus');
	});
});

formInputs.forEach(input => {
	input.addEventListener("blur", function() {
		if(this.value == '') {
			this.classList.remove('focus');
		}
	});
});

document.querySelector('.btn-form').addEventListener('click', function() {
	this.style.animation = ".35s btn-onclick";
	setTimeout(() => this.style.animation = "", 350);
})