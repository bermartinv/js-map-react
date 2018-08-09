import React, { Component } from 'react';
import { GoogleApiWrapper } from 'google-maps-react'
import './App.css';
import MapContainer from './MapContainer'

class App extends Component {
  componentDidMount() {
    document.querySelector('.navicon').addEventListener('click', this.toggleSideBar)
  }

  toggleSideBar = () => {
    document.querySelector('.sidebar').classList.toggle('text-input-hidden')
  }


  render() {
    return (
      <div>
        <a className="menu" tabIndex="0">
          <svg className="navicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M2 6h20v3H2zm0 5h20v3H2zm0 5h20v3H2z"/>
          </svg>
        </a>
        <h1 className="title"> Valencia monuments </h1>
        <MapContainer google={this.props.google} />
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCwaSnM9iISDVw0Nx5JbCEaeFAdFc6UnO0'
})(App)