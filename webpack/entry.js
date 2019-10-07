import React from 'react';
import ReactDOM from 'react-dom';
import ContactForm from '../src/contact_form'

// import movingBG from '../../background-styler/index';
import movingBG from 'background-styler';

movingBG({
  start: [
    [80, 20, 155],
    [35, 5, 92]
  ],
  end: [
    [60, 30, 100],
    [50, 25, 10]
  ],
  time: 4000,
  cycle: true
}).run()

ReactDOM.render(<ContactForm />, document.getElementById('contact-form'));