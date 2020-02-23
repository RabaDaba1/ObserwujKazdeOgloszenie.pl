module.exports = {
	verification(username, token) {
		return {
			from: `"Kacper z ObserwujKażdeOgłoszenie.pl" <${process.env.GMAIL_ADRESS}>`,
			subject: "Zweryfikuj konto ✅",
			html: `
					<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.11.2/css/all.css">
					<nav style="border-bottom: 1px solid black;">
						<h3 
						style="
						font-size: 1.5rem;
						color: black;
						font-weight: 400;">
							ObserwujKażdeOgłoszenie.pl
						</h3>
					</nav>
					<h1 style="font-size: 2rem;" class="title">Zweryfikuj swoje konto</h1>
					<p style="font-size: 1.1rem;" class="text">Cześć ${username}, z tej strony Kacper z ObserwujKażdeOgłoszenie.pl, piszę do Ciebie, żeby upewnić się, że nie jesteś robotem, dlatego proszę Cię o zweryfikowanie swojego maila, wystarczy że klikniesz zielony guzik na dole</p>
						<a href="${process.env.URL}/auth/${token}"
					style="
					display: inline-block;
					padding: .4rem 1rem;
					background: linear-gradient(90deg, rgba(49,213,68,1) 0%, rgba(39,203,24,1) 100%);
					border-radius: 1.25rem;
					font-size: 1.25rem;
					font-weight: 600;
					text-align: center;
					vertical-align: middle;
					user-select: none;
					outline: none;
					cursor: pointer;
					text-decoration: none;
					color: white;" onMouseOver="">
						<i class="far fa-check-circle"></i> Weryfikuj
					</a>
				`
		}
	},
	resetPassword(username, token) {
		return {
			from: `"Kacper z ObserwujKażdeOgłoszenie.pl" <${process.env.GMAIL_ADRESS}>`,
			subject: "Zmień hasło",
			html: `
					<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.11.2/css/all.css">
					<nav style="border-bottom: 1px solid black;">
						<h3 
						style="
						font-size: 1.5rem;
						color: black;
						font-weight: 400;">
							ObserwujKażdeOgłoszenie.pl
						</h3>
					</nav>
					<h1 style="font-size: 2rem;" class="title">Zmień swoje hasło</h1>
					<p style="font-size: 1.1rem;" class="text">Cześć ${username}, z tej strony Kacper z ObserwujKażdeOgłoszenie.pl, chcesz zmienić hasło? Przychodzę z pomocą, wystarczy że klikniesz ten guzik</p>
						<a href="${process.env.URL}/reset/${token}"
					style="
					display: inline-block;
					padding: .4rem 1rem;
					background: linear-gradient(90deg, rgba(49,213,68,1) 0%, rgba(39,203,24,1) 100%);
					border-radius: 1.25rem;
					font-size: 1.25rem;
					font-weight: 600;
					text-align: center;
					vertical-align: middle;
					user-select: none;
					outline: none;
					cursor: pointer;
					text-decoration: none;
					color: white;" onMouseOver="">
						<i class="fas fa-redo"></i> Resetuj
					</a>
				`
		}
	}
}