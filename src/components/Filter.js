import React, { Component } from 'react';
import markerDefault from '../images/marker-default.png';
import markerSelected from '../images/marker-selected.png';
import foursquareLogo from '../images/foursquare.png';
import { checkGetData } from './App';

class Filter extends Component {
  // Constructor
  constructor(props) {
    super(props);

    // Initial states
    this.state = {
      query: '',
      map: {},
      markers: [],
      infowindow: {},
      currentMarkers: []
    }

    // Binding functions to this
    this.showFilter = this.showFilter.bind(this);
    this.hideFilter = this.hideFilter.bind(this);
    this.markerFilter = this.markerFilter.bind(this);
    this.openInfoWindow = this.openInfoWindow.bind(this);
  }

  componentWillMount() {
    setTimeout(() => {

      // Updates states with the props
      this.setState({
        map: this.props.map,
        markers: this.props.markers,
        infowindow: this.props.infowindow,
        currentMarkers: this.props.markers
      });
    }, 1000);
  }

  /**
  * Opens the filter when the icon is activated
  * Any infowindow is closed when the filter is opened
  */ 
  showFilter() {
    const filter = document.querySelector('.filter');
    filter.classList.add('filter_open');
    this.props.infowindow.close();
  }

  /**
  * Closes the filter when the icon is activated
  * Clears the query input and show all markers again
  */ 
  hideFilter() {
    const filter = document.querySelector('.filter');
    filter.classList.remove('filter_open');

    this.setState({
      query: '',
      markers: this.state.currentMarkers
    });

    this.state.currentMarkers.forEach((marker) => marker.setVisible(true));
  }

  /**
  * @description Filters markers based on user query,
  * only the markers that match the query are displayed
  * @param {object} e
  * @param {object} marker
  */
  markerFilter(e) {
    const filteredMarkers = [];
    const markers = this.state.currentMarkers;
    const query = e.target.value.toLowerCase();

    this.setState({
      query: query
    });

    if (query) {
      this.props.infowindow.close();
      markers.forEach((marker) => {
        if (marker.title.toLowerCase().indexOf(query) > -1) {
          marker.setVisible(true);
          filteredMarkers.push(marker);
        } else {
          marker.setVisible(false);
        }
      });

      filteredMarkers.sort(this.sortName);

      this.setState({
        markers: filteredMarkers
      });
    } else {
      this.setState({
        markers: this.state.currentMarkers
      });
      
      markers.forEach((marker) => marker.setVisible(true));
    }
  }

  /**
  * @description Opens the infowindow when a list item is activated,
  * checks and activates the animations
  * @param {object} e
  * @param {object} marker
  */
  openInfoWindow = (e) => {
    console.log(e);
    this.state.markers.forEach((marker) => {
      if (e.name === marker.name) {
        if (checkGetData === true) {
          this.state.infowindow.setContent(
            '<div class="info-wrap">'+
            '<img class="info-photo" src='+e.bestPhoto+' alt="Beach photo"><br>'+
            '<h2 class="info-name">'+e.name+'</h2><br>'+
            '<p class="info-position">Latitude: '+e.lat+'</p><br>'+
            '<p class="info-position">Longitude: '+e.lng+'</p><br>'+
            '<p class="info-address">Address: '+e.address+'</p><br>'+
            '<p class="info-rating">Rating: '+e.rating+'</p><br>'+
            '<p class="info-likes">Likes: '+e.likes+'</p><br>'+
            '<p class="info-tips">Tips: "'+e.tips+'"</p><br>'+
            '<a class="info-link" href='+e.moreInfo+' target="_blank"><span>For more information<span></a><br>'+
            '<img class="info-fslogo" src='+foursquareLogo+' alt="Powered by Foursquare"><br>'+
            '</div>'
          );
        } else {
          this.state.infowindow.setContent(
            '<div class="error-wrap">'+
            '<p class="error-message">Sorry, Foursquare data can&apos;t be loaded!</p><br>'+
            '</div>'
          );
        }

        this.state.infowindow.open(this.props.map, e);

        if (e.getAnimation() !== null) {
          e.setAnimation(null);
        } else {
          e.setAnimation(window.google.maps.Animation.BOUNCE);
          setTimeout(() => {
            e.setAnimation(null);
          }, 1000);
        }
      }
    });
  }

  // Renders the filter, markers list and header
  render() {

    const { query, markers } = this.state;
    const { showFilter, hideFilter, markerFilter, openInfoWindow } = this;

    return (
      <div className='wrap-filter'>
        <div
          onClick={ showFilter }
          onKeyPress={ showFilter }
          className='btnFilter btnFilter_open'
          role='button'
          tabIndex="0"
          title='Open filter'>
          Filter
        </div>
        <h1 className='app-title'>Niterói&apos;s Sun Umbrellas</h1>

        <div id='filter' className='filter'>
          <div className='filter-top'>
            <div
              onClick={ hideFilter }
              onKeyPress={ hideFilter }
              className='btnFilter btnFilter_close'
              role='button'
              tabIndex="0"
              title='Close filter'>
              Out
            </div>
          </div>
          <input
            onChange={ markerFilter }
            className='filter-input'
            type='text'
            role='form'
            aria-labelledby='filter'
            tabIndex="0"
            placeholder='Filter by name'
            value={ query }
          />
          <ul className='filter-list'>
            {Object.keys(markers).map(i => (
              <li className='filter-item' key={ i }>
                <p 
                  onClick={ () => openInfoWindow(markers[i]) }
                  onKeyPress={ () => openInfoWindow(markers[i]) }
                  onMouseOver={ () => markers[i].setIcon(markerSelected) }
                  onMouseOut={ () => markers[i].setIcon(markerDefault) }
                  onFocus={ () => markers[i].setIcon(markerSelected) }
                  onBlur={ () => markers[i].setIcon(markerDefault) }
                  className='filter-item-action'
                  role='button'
                  tabIndex="0">
                  { markers[i].name }
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default Filter;