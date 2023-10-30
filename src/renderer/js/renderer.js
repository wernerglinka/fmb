const frontmatterContainer = document.getElementById('frontmatter-container');


/**
 * @function buildMainForm
 */
function buildMainForm(schemas) {
  // parse the schemas string
  const availableSchemas = schemas.map(schema => JSON.parse(schema));

  // create a form element
  const form = document.createElement('form');
  form.setAttribute('id', 'main-form');

  // loop over the schemas and create a form element for each
  availableSchemas.forEach(schema => {
    if (schema.label) {
      // create a fieldset for the schema
      const fieldset = document.createElement('fieldset');
      // create a legend for the fieldset
      const legend = document.createElement('legend');
      legend.innerHTML = schema.label;
      fieldset.appendChild(legend);
      // create a form element for each value in the schema
      schema.values.forEach(value => {
        const formElement = createFormElement(value, schema.label);
        // add the form element to the fieldset
        fieldset.appendChild(formElement);
      });
      // add the fieldset to the form
      form.appendChild(fieldset);

    } else {
      // create a form element for each value in the schema
      schema.values.forEach(value => {
        const formElement = createFormElement(value, "");
        // add the form element to the form
        form.appendChild(formElement);
      });
    }
  });

  // add submit button
  const submit = document.createElement('button');
  submit.setAttribute('type', 'submit');
  submit.classList.add("submit-primary");
  submit.innerHTML = 'Submit';
  form.appendChild(submit);

  // add the form to the frontmatter container
  frontmatterContainer.appendChild(form);
};


/**
 * @function createFormElement
 * @param {object} value 
 * @param {string} parent 
 * @returns a form element
 */
function createFormElement(value, parent) {
  // create a div to hold the form element
  const div = document.createElement('div');
  div.classList.add('form-element');

  // create the label
  const label = document.createElement('label');
  label.innerHTML = `<span>${value.label}</span>`;

  if (value.widget === 'text') {
    // create the input
    const input = document.createElement('input');
    input.setAttribute('type', "text");
    input.setAttribute('name', (parent === "") ? value.label : `${parent}.${value.label}`);
    input.setAttribute('value', value.value);
    input.placeholder = value.placeholder;

    // create wrapper for input
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(input);

    // add the input to the label element
    label.appendChild(inputWrapper);
  }

  if (value.widget === 'textarea') {
    // create the input
    const input = document.createElement('textarea');
    input.setAttribute('name', (parent === "") ? value.label : `${parent}.${value.label}`);
    input.innerHTML = value.value;
    input.placeholder = value.placeholder;

    // create wrapper for input
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(input);

    // add the input to the label element
    label.appendChild(inputWrapper);
  }

  if (value.widget === 'select') {
    // create the input
    const input = document.createElement('select');
    input.setAttribute('name', (parent === "") ? value.label : `${parent}.${value.label}`);
    input.innerHTML = value.value.map(option => `<option value="${option}">${option}</option>`).join('');
    
    // create wrapper for input
    const inputWrapper = document.createElement('div');
    inputWrapper.classList.add('select-wrapper');
    inputWrapper.appendChild(input);

    // add the input to the label element
    label.appendChild(inputWrapper);
  }

  if (value.widget === 'checkbox') {
    // create the input
    const input = document.createElement('input');
    input.setAttribute('type', "checkbox");
    input.setAttribute('name', (parent === "") ? value.label : `${parent}.${value.label}`);
    input.setAttribute('role', 'switch');
    input.checked = value.value;

    // create wrapper for input
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(input);

    // add the input to the label element
    label.appendChild(inputWrapper);
  }

  // add the label to the div
  div.appendChild(label);

  return div;
}

// wait for the initial schemas to be sent from the main process and build the form
window.electronAPI.schemas((event, schemas) => {
  // build the form from the schemas
  buildMainForm(schemas);
  
  // listen for the form to be submitted
  const mainForm = document.getElementById('main-form');
  mainForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get the form data
    const formData = new FormData(e.target);

    // convert the form data to an object
    const data = Object.fromEntries(formData.entries());

    console.log(data)

  });

});



function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center',
    },
  });
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center',
    },
  });
}
