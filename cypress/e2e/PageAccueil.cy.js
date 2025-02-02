describe('Tests du site portfolio', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.window().then((win) => {
      win.AOS.init({ disable: true })
    })
  })

  it('Vérifie le titre de la page', () => {
    cy.title().should('include', 'Portfolio de Guelmaoui Ferid')
  })

  it('Vérifie la présence et le contenu du header', () => {
    cy.get('header h1').should('contain', 'Guelmaoui Ferid')
    cy.get('nav').should('be.visible')
    cy.get('nav ul li').should('have.length.at.least', 5)
  })

  it('Vérifie la section héro', () => {
    cy.get('#hero').should('be.visible')
    cy.get('#typed-text').should('be.visible')
  })

  it('Vérifie la section présentation', () => {
    cy.get('#presentation').wait(1000).get('#presentation').should('be.visible')
    cy.get('#presentation h2').should('contain', 'Présentation')
    cy.get('#presentation .content-wrapper').should('exist')
  })

  it('Vérifie la section formations', () => {
    cy.get('#formations').should('be.visible')
    cy.get('#formations h2').should('contain', 'Formations proposées')
    cy.get('#formations ul li').should('have.length.at.least', 3)
  })

  it('Vérifie la galerie', () => {
    cy.get('#galerie').should('be.visible')
    cy.get('#gallery-container').should('exist')
  })

  it('Vérifie le formulaire de contact', () => {
    cy.get('#contact').should('be.visible')
    cy.get('#contact-form').should('exist')
    cy.get('#contact-form input[name="nom"]').should('exist')
    cy.get('#contact-form input[name="email"]').should('exist')
    cy.get('#contact-form textarea[name="message"]').should('exist')
  })

  it('Vérifie la section partenaires', () => {
    cy.get('#partenaires').should('be.visible')
    cy.get('.partenaires-grid').should('exist')
    cy.get('.partenaires-grid .partenaire').should('have.length.at.least', 1)
  })

  it('Vérifie le footer', () => {
    cy.get('footer').should('be.visible')
    cy.get('footer p').should('contain', 'Guelmaoui Ferid')
  })

  it('Teste la navigation', () => {
    cy.get('nav a[href="#presentation"]').click()
    cy.url().should('include', '#presentation')
    
    cy.get('nav a[href="#formations"]').click()
    cy.url().should('include', '#formations')
    
    cy.get('nav a[href="#galerie"]').click()
    cy.url().should('include', '#galerie')
    
    cy.get('nav a[href="#contact"]').click()
    cy.url().should('include', '#contact')
  })

  it('Teste le formulaire de contact (sans envoi)', () => {
    cy.get('#contact-form input[name="nom"]').type('Test User')
    cy.get('#contact-form input[name="email"]').type('test@example.com')
    cy.get('#contact-form textarea[name="message"]').type('Ceci est un message de test de plus de 50 caractères pour satisfaire la validation.')
    cy.get('#char-count').should('contain', '50')
  })

  it('Vérifie la réactivité du menu sur mobile', () => {
    cy.viewport('iphone-6')
    cy.get('#menu-toggle').should('be.visible').click()
    cy.get('#main-nav').should('be.visible')
  })
})

describe('Tests du site portfolio - Version Mobile', () => {
  beforeEach(() => {
    cy.viewport('iphone-x')
    cy.visit('/')
    cy.window().then((win) => {
      win.AOS.init({ disable: true })
    })
  })

  it('Vérifie le menu hamburger et la navigation mobile', () => {
    cy.get('#menu-toggle').should('be.visible').click()
    cy.get('#main-nav').should('be.visible')
    cy.get('nav ul li').should('have.length.at.least', 5)
    
    cy.get('nav a[href="#presentation"]').click()
    cy.url().should('include', '#presentation')
    cy.get('#main-nav').should('not.be.visible')
    
    cy.get('#menu-toggle').click()
    cy.get('nav a[href="#formations"]').click()
    cy.url().should('include', '#formations')
  })

  it('Vérifie la réactivité de la section héro', () => {
    cy.get('#hero').should('be.visible')
    cy.get('#typed-text').should('be.visible')
    cy.get('#hero').should('have.css', 'background-image')
  })

  it('Vérifie le formulaire de contact en version mobile', () => {
    cy.get('#contact-form').should('be.visible')
    cy.get('#contact-form input[name="nom"]').type('Test Mobile')
    cy.get('#contact-form input[name="email"]').type('test.mobile@example.com')
    cy.get('#contact-form textarea[name="message"]').type('Ceci est un test du formulaire de contact sur mobile.')
    cy.get('#char-count').should('contain', '50')
  })

  it('Vérifie la galerie en version mobile', () => {
    cy.get('#galerie').scrollIntoView()
    cy.get('#gallery-container').should('be.visible')
    cy.get('.gallery-item').should('have.length.at.least', 1)
  })

  it('Vérifie la section partenaires en version mobile', () => {
    cy.get('#partenaires').scrollIntoView()
    cy.get('.partenaires-grid').should('be.visible')
    cy.get('.partenaires-grid .partenaire').should('have.length.at.least', 1)
  })

  it('Vérifie le chargement des images en version mobile', () => {
    cy.get('img').each(($img) => {
      cy.wrap($img).should('be.visible').and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      })
    })
  })

  it('Vérifie l\'accessibilité du bouton Admin en version mobile', () => {

    cy.get('#menu-toggle').should('be.visible').click()
    
    cy.get('#main-nav').should('be.visible')
    
    cy.get('#login-link').should('be.visible').click()
    
    cy.get('#login-modal').should('be.visible')
    
    cy.get('.close').click()
    
    cy.get('#login-modal').should('not.be.visible')
    
    cy.get('#menu-toggle').click()
    
    cy.get('#main-nav').should('be.visible')

    cy.get('#menu-toggle').click()

    cy.get('#main-nav').should('not.be.visible')
  })
})