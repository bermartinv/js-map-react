import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {mapStyles} from './mapStyle.js' // import map style


export default class MapContainer extends Component {

  state = {
    locations: [
      {name: "Catedral", location: {lat: 39.4755998, lng: -0.3774011}, nameWiki: "Catedral_de_Santa_María_de_Valencia"},
      {name: "Oceanografico", location: {lat: 39.4530614 , lng: -0.349307}, nameWiki: "Oceanogràfic"},
      {name: "Ciudad de las Artes y las Ciencias", location: {lat: 39.4537702, lng: -0.350575}, nameWiki: "Ciudad_de_las_Artes_y_las_Ciencias"},
      {name: "Hemisferic", location: {lat: 39.4556715, lng: -0.3543899}, nameWiki: "L%27Hemisfèric"},
      {name: "Palacio de las Artes Reina Sofia", location: {lat: 39.4583645, lng: -0.3583614}, nameWiki: "Palacio_de_las_Artes_Reina_Sofía"},
      {name: "Veles e Vents", location: {lat: 39.4564518, lng: -0.34079}, nameWiki: "Veles_e_vents"},
      {name: "Llotja de la Seda", location: {lat: 39.472879, lng: -0.3800787}, nameWiki:"Lonja_de_la_Seda"}
    ],
    query: '',
    markers: [],
    infowindow: new this.props.google.maps.InfoWindow(),
    highlightedIcon: null,
    articlesWikipedia : [],
    FetchError : false
  }

  componentDidMount() {
    this.loadMap()
    this.onclickLocation()
    // Create a "highlighted location" marker color for when the user
    // clicks on the marker.
    this.setState({highlightedIcon: this.makeMarkerIcon('47d147')})
  }

  loadMap() {
    if (this.props && this.props.google) {
      const {google} = this.props
      const maps = google.maps

      const mapRef = this.refs.map
      const node = ReactDOM.findDOMNode(mapRef)

      const mapConfig = Object.assign({}, {
        center: {lat: 39.469908 , lng: -0.376288},
        zoom: 10,
        styles: mapStyles,
        mapTypeId: 'roadmap',
        mapTypeControl : false
      })

      this.map = new maps.Map(node, mapConfig)
      this.addMarkers()
    }

  }

  onclickLocation = () => {
    const that = this
    const {infowindow} = this.state

    const displayInfowindow = (e) => {
      const {markers} = this.state
      const markerInd =
        markers.findIndex(m => m.title.toLowerCase() === e.target.innerText.toLowerCase())
      that.populateInfoWindow(markers[markerInd], infowindow)
    }
    document.querySelector('.locations-list').addEventListener('click', function (e) {
      if (e.target && e.target.nodeName === "LI") {
        displayInfowindow(e)
      }
    })
  }

  handleValueChange = (e) => {
    this.setState({query: e.target.value})
  }

  addMarkers = () => {
    const {google} = this.props
    let {infowindow} = this.state
    const bounds = new google.maps.LatLngBounds()

    this.state.locations.forEach((location, ind) => {
      const marker = new google.maps.Marker({
        position: {lat: location.location.lat, lng: location.location.lng},
        map: this.map,
        title: location.name
      })

      marker.addListener('click', () => {
        this.populateInfoWindow(marker, infowindow)
      })
      this.setState((state) => ({
        markers: [...state.markers, marker]
      }))
      bounds.extend(marker.position)
    })
    this.map.fitBounds(bounds)
  }

  populateInfoWindow = (marker, infowindow) => {
    const defaultIcon = marker.getIcon()
    const {highlightedIcon, markers,FetchError} = this.state
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker !== marker) {
      // reset the color of previous marker
      if (infowindow.marker) {
        const ind = markers.findIndex(m => m.title === infowindow.marker.title)
        markers[ind].setIcon(defaultIcon)
      }
      // change marker icon color of clicked marker
      marker.setIcon(highlightedIcon)
      infowindow.marker = marker
      // Mensaje de error
      if (FetchError) { 
        alert('Oops! Something went wrong.')
      }
      infowindow.setContent(`<h3>${marker.title} ${marker.position}</h3><h4>user likes it </h4>`)
      infowindow.open(this.map, marker)
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function () {
        infowindow.marker = null
      })
    }
  }

  makeMarkerIcon = (markerColor) => {
    const {google} = this.props
    let markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));
    return markerImage;
  }
/*
  
    //This function getting an article about location and save the html code in this.state.theArticle
    peticionFETCH = (nameOfLocation) => {
      
      // We'll use this array to save the article and then pass it to the state 
      let fetchedArticle = []

      //Fetch the datas from Wiki using provided query
      fetch(`https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=extracts&titles=${nameOfLocation}&exintro=1`)

      .then(result => {
        return result.json()
       })

       .then(resultArticle => {

        // Extract the article and save it in fetchedArticle array
        let article = resultArticle.query.pages[Object.keys(resultArticle.query.pages)[0]].extract;
        fetchedArticle.push(article)

       })

       //Catch the errors
       .catch(err => {
         console.log(err)
         this.setState({wikiError: true})
       })

       //pass the article to the state
       this.setState({theArticle: fetchedArticle})

    }
  }
*/

  render() {
    const {locations, query, markers, infowindow} = this.state
    if (query) {
      locations.forEach((l, i) => {
        if (l.name.toLowerCase().includes(query.toLowerCase())) {
          markers[i].setVisible(true)
        } else {
          if (infowindow.marker === markers[i]) {
            // close the info window if marker removed
            infowindow.close()
          }
          markers[i].setVisible(false)
        }
      })
    } else {
      locations.forEach((l, i) => {
        if (markers.length && markers[i]) {
          markers[i].setVisible(true)
        }
      })
    }
    return (
      <div>
        <div className="container">
          <div className="text-input">
            <input role="search" type='text'
                   value={this.state.value}
                   onChange={this.handleValueChange}/>
            <ul className="locations-list">{
              markers.filter(m => m.getVisible()).map((m, i) =>
                (<li key={i}>{m.title}</li>))
            }</ul>
          </div>
          <div role="application" className="map" ref="map">
            loading map...
          </div>
        </div>
      </div>
    )
  }
}