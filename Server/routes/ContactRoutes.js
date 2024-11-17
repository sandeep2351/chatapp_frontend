const { Router } = require('express');
const { getContactfordmlist, searchcontacts, getAllContacts } = require('../controllers/ContactController');
const { verifytoken } = require('../middlewares/Authmiddleware');

const contactsRoutes = Router();

contactsRoutes.get('/get-contacts-dm', verifytoken, getContactfordmlist);
contactsRoutes.post('/search', verifytoken, searchcontacts);
contactsRoutes.get("/get-all-contacts",verifytoken,getAllContacts)

module.exports = { contactsRoutes }; // Ensure this is correct
