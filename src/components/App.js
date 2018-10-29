import React, { Component } from 'react';
import '../App.css';
import scriptLoader from 'react-async-script-loader';
import { MAP_API_KEY } from '../data/auth';
import { FS_CLIENT_ID } from '../data/auth';
import { FS_CLIENT_SECRET } from '../data/auth';
import { locations } from '../data/locations';
import { mapStyle } from '../data/mapStyle';
import markerDefault from '../images/marker-default.png';
import markerSelected from '../images/marker-selected.png';
import foursquareLogo from '../images/foursquare.png';
import Map from './Map';
import Filter from './Filter';

let buildMap = {};
export let checkGetData = '';

class App extends Component {
  // Constructor
  constructor(props) {
    super(props);

    // Initial states
    this.state = {
      map: {},
      markers: [],
      infowindow: {}
    }
    // Binding the getData function to this
    this.getData = this.getData.bind(this);
  }

  componentWillReceiveProps({isScriptLoadSucceed}) {
    // Conditional to initialize the map when the script loads
    if (isScriptLoadSucceed) {

      // Calls this function to fetch Foursquare data asynchronously
      this.getData();

      // Initialize Google Maps    
      buildMap = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: -22.9139064, lng: -43.0963434 },
        zoom: 12,
        styles: mapStyle,
        mapTypeControl: false,
        fullscreenControl: false
      });
    
      const buildInfoWindow = new window.google.maps.InfoWindow({maxWidth: 320});
      const bounds = new window.google.maps.LatLngBounds();    
      const myEvents = 'click keypress'.split(' ');
      let buildMarkers = [];
      let allLocations = [];
    
      setTimeout(() => {

        /**
        * Checks if the markers state get Foursquare data for all markers
        * else the markers will be built with the locations stored in the data directory
        */
        if (this.state.markers.length === 12) {
          allLocations = this.state.markers;
          console.log(allLocations);

          /**
          * Confirmation that Foursquare data has been received
          * this information will be used in other parts of the App
          */
          checkGetData = true;

        } else {
          allLocations = locations;
          console.log(allLocations);
        }
    
        for (let i = 0; i < allLocations.length; i++) {
          let position = {lat: allLocations[i].location.lat, lng: allLocations[i].location.lng};
          let name = allLocations[i].name;
          let address = allLocations[i].location.address;
          let lat = allLocations[i].location.lat;
          let lng = allLocations[i].location.lng;
          let bestPhoto = '';
          let rating = '';
          let likes = '';
          let tips = '';
          let moreInfo = '';
    
          if (checkGetData === true) {
            bestPhoto = allLocations[i].bestPhoto.prefix.concat('width300', allLocations[i].bestPhoto.suffix);
            rating = allLocations[i].rating;
            likes = allLocations[i].likes.count;
            tips = allLocations[i].tips.groups[0].items[0].text;
            moreInfo = allLocations[i].canonicalUrl;
          }
    
          let marker = new window.google.maps.Marker({
            id: i,
            map: buildMap,
            position: position,
            name: name,
            title: name,
            address: address,
            lat: lat,
            lng: lng,
            bestPhoto: bestPhoto,
            rating: rating,
            likes: likes,
            tips: tips,
            moreInfo: moreInfo,
            icon: markerDefault,
            animation: window.google.maps.Animation.DROP
          });
          
          buildMarkers.push(marker);

          // Adds event listeners to all created markers          
          for (let i = 0; i < myEvents.length; i++) {
            marker.addListener(myEvents[i], function() {
              addInfoWindow(this, buildInfoWindow);
              this.setAnimation(window.google.maps.Animation.BOUNCE);
              setTimeout(function () {
                marker.setAnimation(null);
              }, 1000);
            });
          }
    
          marker.addListener('mouseover', function() {
            this.setIcon(markerSelected);
          });
    
          marker.addListener('mouseout', function() {
            this.setIcon(markerDefault);
          });
    
          bounds.extend(buildMarkers[i].position);
        }
    
        buildMap.fitBounds(bounds);

        // Updates states with prepared data    
        this.setState({
          map: buildMap,
          markers: buildMarkers,
          infowindow: buildInfoWindow
        });
      }, 800);

    // Indication when the map can't be loaded
    } else {
      alert('Sorry, Google Maps can&apos;t be loaded. Try later!');
    }
  }

  /**
  * @description Fetch Foursquare data asynchronously
  * @param {object} location
  * @param {object} response
  * @param {object} data
  * @param {object} error
  */
  getData() {
    let places = [];
    locations.map((location) =>
      fetch(`https://api.foursquare.com/v2/venues/${location.venueId}` +
        `?client_id=${FS_CLIENT_ID}` +
        `&client_secret=${FS_CLIENT_SECRET}` +
        `&v=20180323`)
        .then(response => response.json())
        .then(data => {
          if (data.meta.code === 200) {
            places.push(data.response.venue);
          }
        }).catch(error => {
          checkGetData = false;
          console.log(error);
        })
    );

    // Updates the markers state with the data obtained
    this.setState({
      markers: places
    });
    console.log(this.state.markers);
  }
  
  // Renders the App
  render() {
    return (
      <div className='App' role='main'>
        <Filter
          map={ this.state.map }
          markers={ this.state.markers }
          infowindow={ this.state.infowindow }
        />
        <Map />
      </div>
    );
  }
}

/**
* @description Opens the infowindow
* @param {object} marker
* @param {object} infowindow
* @param {object} buildMap
*/
function addInfoWindow(marker, infowindow) {
  if (checkGetData === true) {
    infowindow.setContent(
      '<div class="info-wrap">'+
      '<img class="info-photo" src='+marker.bestPhoto+' alt="Beach photo"><br>'+
      '<h2 class="info-name">'+marker.name+'</h2><br>'+
      '<p class="info-position">Latitude: '+marker.lat+'</p><br>'+
      '<p class="info-position">Longitude: '+marker.lng+'</p><br>'+
      '<p class="info-address">Address: '+marker.address+'</p><br>'+
      '<p class="info-rating">Rating: '+marker.rating+'</p><br>'+
      '<p class="info-likes">Likes: '+marker.likes+'</p><br>'+
      '<p class="info-tips">Tips: "'+marker.tips+'"</p><br>'+
      '<a class="info-link" href='+marker.moreInfo+' target="_blank"><span>For more information<span></a><br>'+
      '<img class="info-fslogo" src='+foursquareLogo+' alt="Powered by Foursquare"><br>'+
      '</div>'
    );
  } else {
    infowindow.setContent(
      '<div class="error-wrap">'+
      '<p class="error-message">Sorry, Foursquare data can&apos;t be loaded!</p><br>'+
      '</div>'
    );
  }
  infowindow.open(buildMap, marker);
}

// Load the Google Maps asynchronously
export default scriptLoader(
  [`https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}`]
)(App);