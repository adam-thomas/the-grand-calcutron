import React from "react";
import ReactDOM from "react-dom";

class App extends React.Component {
    render() {
        return (<h1>hooray, it worked, part 2!</h1>);
    }
}

const wrapper = document.getElementById("app");
if (wrapper) {
    ReactDOM.render(<App />, wrapper);
}
