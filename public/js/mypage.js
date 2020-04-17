const UIController = (function () {
    const DOMStrings = {
        switchBtn: document.querySelector('#header-buttons .switch'),
        generalInfoSection: document.querySelector('#general-info'),
        profileInfoSection: document.querySelector('#profile-info')
    };
    
    return {
        DOMStrings,
        switchSections(button) {
            if(button.textContent === 'Mój profil') {
                button.textContent = 'Moje statystyki';
                DOMStrings.generalInfoSection.style.display = 'none';
                DOMStrings.profileInfoSection.style.display = 'block';
            } else {
                button.textContent = 'Mój profil';
                DOMStrings.generalInfoSection.style.display = 'block';
                DOMStrings.profileInfoSection.style.display = 'none';
            }
        }
    };
})();

const controller = (function(UIController) {
    const DOMStrings = UIController.DOMStrings;

    const setUpEventListeners = () => {
        DOMStrings.switchBtn.addEventListener('click', function (event) {
            event.preventDefault();
            UIController.switchSections(this);
        });
    };
    
    return {
        init() {
            setUpEventListeners();
        }
    };
})(UIController);

controller.init();