// components-renderer.js is of type module, so we can use "await" in it.

function defineFormComponent(type) {
  // create a div to hold the form element
  const div = document.createElement('div');
  div.classList.add('compose', 'form-element');
  
  if( type === 'text' ) {
    /**
     * Create the text input object
     * {
     *   "label": "",
     *   "type": "variable",
     *   "widget": "text",
     *   "value": "",
     *   "placeholder": ""
     * } 
     */ 

    // create the label for label input
    const label = document.createElement('label');
    label.innerHTML = `<span>Label for Text element</span>`;

    // create the label input
    const labelInput = document.createElement('input');
    labelInput.setAttribute('type', "text");
    labelInput.placeholder = "Label Placeholder";

    // create wrapper for input for styling
    const labelInputWrapper = document.createElement('div');
    labelInputWrapper.appendChild(labelInput);

    // add the input to the label element
    label.appendChild(labelInputWrapper);
    
    // add the label to the div
    div.appendChild(label);
    
    // create the label for text input
    const labelText = document.createElement('label');
    labelText.innerHTML = `<span>Optional Text for Text element</span>`;

    // create the label input
    const textInput = document.createElement('input');
    textInput.setAttribute('type', "text");
    textInput.placeholder = "Label Placeholder";

    // create wrapper for input for styling
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(textInput);

    // add the input to the label element
    labelText.appendChild(inputWrapper);
    
    // add the label to the div
    div.appendChild(labelText);
  }
  return div; 
};



const componentContainer = document.getElementById("component-container");

// create a form
const form = document.createElement('form');
form.setAttribute('id', "component-form");





window.electronAPI.receiveComponentType((event, componentType) => {
  const forHeader = document.createElement('h2');
  forHeader.innerHTML = `Define ${componentType}`;
  form.appendChild(forHeader);
  // create new element with requested component type
  const newElement = defineFormComponent(componentType);
  // add the new element to the form
  form.appendChild(newElement);
  // add the form to the component container
  componentContainer.appendChild(form);

});
