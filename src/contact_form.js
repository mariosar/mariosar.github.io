import React from "react";
import { Form, Field } from 'react-final-form'

const regexTestEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const regexTestTelephone = (telephone) => {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(String(telephone));
}

class ContactForm extends React.Component{
  constructor(props){
    super(props)
  }
  
  handleSubmit(values, form){
    var form = document.createElement("form")
    form.action = "https://briskforms.com/go/49765f2aadab8905e27bc4517f4f5ebd"
    form.method = "POST"

    for (const key in values) {
      if (values.hasOwnProperty(key)) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = key;
        hiddenField.value = values[key];
  
        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit()
  }

  render(){
    return(
      <div>
        <Form
          validate={this.validate}
          onSubmit={this.handleSubmit}
        >
          {({ handleSubmit, form, submitting, pristine, validating, values }) => (
            <form className="ui form" onSubmit={handleSubmit}>
              <h4 className="ui header" style={{"font-style": "italic"}}>Do you:</h4>
              <div className="ui list" style={{"marginLeft": "1em"}}>
                <div className="item"><i className="violet help icon"></i> have questions about this site?</div>
                <div className="item"><i className="violet help icon"></i> need help with a project?</div>
                <div className="item"><i className="violet help icon"></i> or want to hire me?</div>
              </div>
              <p>Please drop me a message using the form. <em>Thanks</em>!</p>
              <div className="field">
                <label>Name</label>
                <div className="two fields">
                  <Field
                    name="first_name"
                    render={({ input, meta }) => (
                      <div className={"field"+(meta.error && meta.touched ? " error" : "")}>
                        <input type="text" {...input} placeholder="First Name" />
                      </div>
                    )}
                    validate={(value) => {
                      if(!value){
                        return "Reguired"
                      }
                    }}
                  />
                  <Field
                    name="last_name"
                    render={({ input, meta }) => (
                      <div className={"field"+(meta.error && meta.touched ? " error" : "")}>
                        <input type="text" {...input} placeholder="Last Name" />
                      </div>
                    )}
                    validate={(value) => {
                      if(!value){
                        return "Reguired"
                      }
                    }}
                  />
                </div>
              </div>
              <div className="two fields">
                <div className="field">
                  <label>Email</label>
                  <Field
                    name="email_name"
                    render={({ input, meta }) => (
                      <div className={"field"+(meta.error && meta.touched ? " error" : "")}>
                        <input type="text" {...input} placeholder="Email Name" />
                      </div>
                    )}
                    validate={(value) => {
                      if(!value){
                        return "Reguired"
                      } else if(!regexTestEmail(value)) {
                        return "Invalid email"
                      }
                    }}
                  />
                </div>
                <div className="field">
                  <label>Telephone <div className="muted">(optional)</div></label>
                  <Field
                    name="telephone"
                    render={({ input, meta }) => (
                      <div className={"field"+(meta.error && meta.touched ? " error" : "")}>
                        <input type="text" {...input} placeholder="Telephone" />
                      </div>
                    )}
                    validate={(value) => {
                      if(!!value && !regexTestTelephone(value)){
                        return "Invalid telephone"
                      }
                    }}
                  />
                </div>
              </div>
              <div className="field">
                <label>Short Message</label>
                <Field 
                  name="message" 
                  render={({ input, meta }) => (
                    <div className={"field"+(meta.error && meta.touched ? " error" : "")}>
                      <textarea {...input} rows="2"></textarea>
                    </div>
                  )}
                  validate={(value) => {
                    if(!value){
                      return "Required"
                    }
                  }}
                />
              </div>
              
              <div className="field">
                <label>We know you're human but just to be sure...</label>
                <Field
                  name="captcha_test"
                  render={({ input, meta }) => (
                    <div className={"field"+(meta.error && meta.touched ? " error" : "")}>
                      <input type="text" {...input} placeholder="Enter 32 /2" />
                    </div>
                  )}
                  validate={(value) => {
                    if(!value){
                      return "Required"
                    } else if(value != "16"){
                      return "Incorrect"
                    }
                  }}
                />
              </div>

              <button className="ui button violet" type="submit" disabled={submitting || validating}>Submit</button>
            </form>
          )}
        </Form>
      </div>
    )
  }
}

export default ContactForm;