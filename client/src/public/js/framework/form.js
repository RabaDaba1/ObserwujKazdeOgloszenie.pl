const formInputs = Array.from(document.querySelectorAll('.form__inputs input'));

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

document.querySelector('.form__button').addEventListener('click', function() {
	this.style.animation = ".35s btn-onclick";
	setTimeout(() => this.style.animation = "", 350);
})