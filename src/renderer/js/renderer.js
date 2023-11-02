// renderer.js is of type module, so we can use "await" in it.
  
/**
 * @function renderSchema
 * @param {object} schema
 * @returns void
 */
function renderSchema(schema, form) {
  if (schema.label) {
    // create a fieldset for its values
    const fieldset = document.createElement('fieldset');
    // create a legend for the fieldset
    const legend = document.createElement('legend');
    legend.innerHTML = schema.label;
    fieldset.appendChild(legend);
    
    // create a form element for each value in the fieldset
    schema.values.forEach(value => {
      const formElement = createFormElementFromSchema(value, schema.label);
      // add the form element to the fieldset
      fieldset.appendChild(formElement);
    });

    // add the fieldset to the form
    form.appendChild(fieldset);

  } else {
    // create a 'stand-alone' form element for each value in the schema
    schema.values.forEach(value => {
      const formElement = createFormElementFromSchema(value, "");
      // add the form element to the form
      form.appendChild(formElement);
    });
  }
};


/**
 * @function createFormElementFromSchema
 * @param {object} value 
 * @param {string} parent 
 * @returns a form element
 */
function createFormElementFromSchema(value, parent) {
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

const widgetSelections = [ 
  "text", 
  "textarea", 
  "object", 
  "array"
]

/**
 * @function renderFrontmatterSelectForm
 * @description This function will render a select widget for the frontmatter
 * @returns the frontmatter select form
 */
function renderFrontmatterSelectWidget() {
  const widget = `
    <button id="select-component" class="form-button">Select a component</button>
    <ul class="select-component-menu">
    ${widgetSelections.map(option => `<li>${option}</li>`).join('')}
    </ul>
    `
  const widgetWrapper = document.createElement('div');
  widgetWrapper.classList.add('frontmatter-select');
  widgetWrapper.innerHTML = widget;

  return widgetWrapper;
}

/**
 * @function renderMainForm
 * @param {array} schemas - an array of schemas
 * @param {string} formId - the id of the form
 * @description This function will build the main form and renders it to the DOM
 * @returns void
 */
function renderMainForm(schemas, formId) {
  const frontmatterContainer = document.getElementById('frontmatter-container');

  // add a widget for the frontmatter selection
  const frontmatterSelectWidget = renderFrontmatterSelectWidget();
  frontmatterContainer.appendChild(frontmatterSelectWidget);

  // create a form
  const form = document.createElement('form');
  form.setAttribute('id', formId);

  // check if there are any schemas and render them first
  // used for page specific frontmatter components
  if(schemas.length > 0) {
    // parse the schemas string
    const availableSchemas = schemas.map(schema => JSON.parse(schema));

    // loop over the schemas and create a form element for each
    availableSchemas.forEach(schema => {
      renderSchema(schema, form);
    });
  }

  // add submit button
  const submit = document.createElement('button');
  submit.setAttribute('type', 'submit');
  submit.id = 'submit-primary';
  submit.classList.add('form-button');
  submit.innerHTML = 'Submit';
  form.appendChild(submit);

  // add the form to the frontmatter container
  frontmatterContainer.appendChild(form);
};

/**
   * @function convertFormdataToObject
   * @param {object} flatValues - the object to create the object with
   * @description This function will create an object with the flatValues.
   * It will loop through the flatValues and create all properties of an object
   * @returns {object}
   */
function convertFormdataToObject(flatValues) {
  const pageObject = {};

  for (let key in flatValues) {
    if (flatValues.hasOwnProperty(key)) {
      let keys = key.replace(/\[(\d+)\]/g, '.$1').split('.'); // Convert 'prop[0]' to 'prop.0'
      let lastKey = keys.pop();
      let temp = pageObject;

      for (let k of keys) {
        // checks if the current key k is a string representing a positive integer 
        // (the regex ^\d+$ tests for one or more digits). If it is, k is converted 
        // to an actual number using parseInt(k).
        if (/^\d+$/.test(k)) k = parseInt(k); // Convert string number to integer

        // If temp[k] is undefined, it is initialized as either an array [] or an object {}, 
        // depending on the next key in the keys array. If the next key is a string representing 
        // a positive integer, temp[k] is initialized as an array []; otherwise, it's initialized 
        // as an object {}.
        if (typeof temp[k] === 'undefined') {
          temp[k] = /^\d+$/.test(keys[keys.indexOf(k) + 1]) ? [] : {}; // Initialize as array or object
        }

        // update temp to reference its own property temp[k], effectively moving 
        // one level deeper in the object structure for the next iteration.
        temp = temp[k];
      }

      // update the value of the pageObject at the last key with the value of the flatValues at the current key
      temp[lastKey] = flatValues[key];
    }
  }

  return pageObject;
}

/**
 * @function writeObjectToFile
 * @description This function will get the form data, convert it to an object and write it to a file
 * @returns void
 */
function writeObjectToFile() {
  // Get all form data manually since the form data object will not include
  // any unchecked checkboxes. If we use formData and then check for checkboxes, we will 
  // loose the order of object properties
  const allFormElements = document.querySelectorAll(".form-element");
  const formDataObj = {};
  allFormElements.forEach(formElement => {
    const key = formElement.querySelector("input, textarea, select").name;
    const value = formElement.querySelector("input, textarea, select").value;
    formDataObj[key] = value;
  });

  // Create the page object. This step will create a deep object, e.g. 
  // "seo.title": "My Title" will be converted to { seo: { title: "My Title" } }
  const pageObject = convertFormdataToObject(formDataObj);

  // send the page object to the main process
  window.electronAPI.writeObjectToFile(pageObject);
};

// get the project schemas directory from the main process
const dialogConfig = {
  message: 'Select the Schemas Directory',
  buttonLabel: 'Select',
  properties: ['openDirectory']
};
const schemasDirectory = await window.electronAPI.openDialog('showOpenDialog', dialogConfig);

// get the schemas in the directory from the main process
let schemas = [];
if(schemasDirectory.filePaths[0] !== undefined) {
  schemas = await window.electronAPI.getSchemas(schemasDirectory.filePaths[0]);
}

// Build the form from the schemas
const formId = 'main-form';
renderMainForm(schemas, formId);

// Listen for form submittion
const mainForm = document.getElementById(formId);
mainForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get form data, convert to object and write to file
  writeObjectToFile();
});

// Listen for frontmatter component selection
window.electronAPI.receiveFromOtherRenderer((event, objectReceived) => {
  // Do something with the received object

  console.log(`objectReceived: ${objectReceived}`);

  console.log(JSON.stringify(objectReceived, null, 2));
});




