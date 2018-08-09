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
    query: '',    // search
    markers: [],  // map markers
    infowindow: new this.props.google.maps.InfoWindow(),  // infowindow from marker map
    highlightedIcon: null,    // style click marker
    articleWikipedia : '',    // article fetch wikipedia marker
    FetchError : false      // error fethc wikipedia
  }

  componentDidMount() {
    // show map
    this.loadMap()
    // click list markers
    this.onclickLocation()
    // Create highlightedIcon style when click on marker
    this.setState({highlightedIcon: this.makeMarkerIcon('47d147')})
  }

  // Load map
  loadMap() {
    if (this.props && this.props.google) {
      const {google} = this.props
      const maps = google.maps

      const mapRef = this.refs.map
      const node = ReactDOM.findDOMNode(mapRef)

      // main style map
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

  // list click markers
  onclickLocation = () => {
    const that = this
    const {infowindow} = this.state

    const displayInfowindow = (e) => {
      const {markers} = this.state
      const markerInd =
        markers.findIndex(m => m.title.toLowerCase() === e.target.innerText.toLowerCase())
      that.populateInfoWindow(markers[markerInd], infowindow)
    }
    document.querySelector('.list').addEventListener('click', function (e) {
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
        title: location.name,
        nameWiki : location.nameWiki
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
    const {highlightedIcon, markers,FetchError,articleWikipedia} = this.state
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
      // show alert fetch error
      if (FetchError) { 
        alert('Request with Wikipedia went wrong.')
      }
      this.getArticle(marker);
      infowindow.setContent(`<h1>${marker.title}</h1><h3> Location : ${marker.position}</h3><p>${articleWikipedia}</p>`)
      infowindow.open(this.map, marker)
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function () {
        infowindow.marker = null
      })
    }
  }


  // get Article marker from wikipedia
    getArticle(marker){   

      //Fetch the datas from Wiki using provided query
      fetch(`https://es.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=extracts&titles=${marker.nameWiki}&exintro=1`)
      

      .then(result => {
        return result.json()
       })
    

       .then(resultArticle => {
        // Extract the article 
        let article = resultArticle.query.pages[Object.keys(resultArticle.query.pages)[0]].extract;
        this.setState({articleWikipedia: article})
        //console.log(this.state.articleWikipedia)
       })


       .catch(err => {
         console.log(err)
         this.setState({FetchError: true})
       })
       
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
        <div className="sidebar text-input text-input-hidden">
            <input role="search" type='text'
                   value={this.state.value}
                   onChange={this.handleValueChange}/>
            <ul className="list">{
              markers.filter(m => m.getVisible()).map((m, i) =>
                (<li key={i}>{m.title}</li>))
            }</ul>
          </div>
          <div role="application" className="map" ref="map">
            Please wait a moment ...
          </div>
        </div>
      </div>
    )
  }
}