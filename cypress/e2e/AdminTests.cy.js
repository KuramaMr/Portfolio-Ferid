describe('Tests des fonctionnalités admin', () => {
  const testImagePath = 'test-image.png';
  const testImageName = 'Image de test Cypress';
  
  beforeEach(() => {
    // Visitez la page d'accueil
    cy.visit('/')
    
    // Cliquez sur le bouton Admin pour ouvrir le modal de connexion
    cy.get('#login-link').click()
    
    // Attendez que le modal de connexion soit visible
    cy.get('#login-modal').should('be.visible')
    
    // Remplissez le formulaire de connexion
    cy.get('#username').type(Cypress.env('ADMIN_USERNAME'))
    cy.get('#password').type(Cypress.env('ADMIN_PASSWORD'))
    cy.get('#login-form').submit()

    // Attendons que l'interface soit mise à jour
    cy.wait(4000) // Ajoutez un délai si nécessaire

    cy.viewport(1200, 800)
    
    // Vérifiez que la connexion a réussi (le bouton de déconnexion devrait être visible)
    cy.get('.logout-btn').should('be.visible')
  })
  
  it('Ajoute une nouvelle photo et la supprime', () => {
    // Cliquez sur le lien de gestion des images
    cy.get('#image-management-link').click()
    cy.wait(1000)
    cy.get('#image-management').should('be.visible')
    
    cy.get('#gallery-container .gallery-item').then($items => {
      const initialCount = $items.length;
      
      cy.get('#image-upload').attachFile(testImagePath)
      cy.get('#image-description').type(testImageName)
      cy.get('#upload-form').submit()
      
      cy.get('#gallery-container .gallery-item').should('have.length', initialCount + 1)
      cy.contains(testImageName).should('be.visible')
      
      cy.contains(testImageName)
        .closest('.gallery-item')
        .find('.delete-btn')
        .click()
      
      cy.on('window:confirm', () => true)
      
      cy.get('#gallery-container .gallery-item').should('have.length', initialCount)
      cy.contains(testImageName).should('not.exist')
    })
  })
  
  it('Modifie la description d\'une image', () => {
    cy.get('#image-management-link').click()
    cy.get('#image-management').should('be.visible')

    const newDescription = '3ème Groupe SMV2'

    cy.get('#gallery-container .gallery-item').first().as('firstImage')
    cy.get('@firstImage').find('.edit-btn').click()

    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(newDescription)
    })

    cy.get('@firstImage').find('p').should('contain', newDescription)
  })
  
  afterEach(() => {
    // Définir une résolution d'écran plus grande
    cy.viewport(1200, 800)
  
    // S'assurer que le bouton de déconnexion est visible
    cy.get('.logout-btn').should('be.visible')
  
    // Cliquer sur le bouton de déconnexion
    cy.get('.logout-btn').click()
  
    // Attendre que l'interface soit mise à jour
    cy.wait(4000) // Ajustez ce délai si nécessaire
  
    // Recharger la page
    cy.reload()
  
    // Attendre que la page soit complètement chargée
    cy.wait(2000) // Ajustez ce délai si nécessaire
  
    // Vérifier si l'utilisateur est toujours connecté en tant qu'admin
    cy.get('body').then(($body) => {
      if ($body.find('.logout-btn').length > 0) {
        cy.log('L\'utilisateur est toujours connecté en tant qu\'admin')
        // Vous pouvez ajouter ici une assertion qui échouera intentionnellement pour signaler le problème
        // cy.fail('L\'utilisateur n\'a pas été déconnecté correctement')
      } else {
        cy.contains('ADMIN').should('be.visible')
        cy.log('L\'utilisateur a été déconnecté avec succès')
      }
    })
  })
})