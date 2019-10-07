import React from 'react';
import ReactDOM from 'react-dom';
import ContactForm from '../src/contact_form'

import movingBG from 'background-styler';

movingBG().run()

ReactDOM.render(<ContactForm />, document.getElementById('contact-form'));