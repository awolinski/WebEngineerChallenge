import _ from 'lodash';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// Web Engineer Challenge: last modified January 20, 2019

class App extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            term: '',
            searchResults: {},
            hideSearchResults: false,
            favourites: [],
        };
    }

    // Add item to favourites list if not already favourited, otherwise 'unfavourite' it
    addToFavourites = (title, description) => {
        let favourite = true;
        const array = this.state.favourites;
        const newArray = array.filter((item) => {
            if (item[0] === title && item[1] === description) {
                favourite = false;
                document.getElementById(title).style.color = 'lightgrey';
            }
            return (item[0] !== title && item[1] !== description)
        });
        if (favourite) {
            document.getElementById(title).style.color = 'rgb(12, 151, 93)';
            newArray.push([title, description]);
        };
        this.setState({ favourites: newArray });
    }

    // Remove item from favourites list and change the star color back to light grey
    removeFromFavourites = (title, description) => {
        const array = this.state.favourites;
        const newArray = array.filter((item) => {
            return (item[0] !== title && item[1] !== description)
        });
        if (document.getElementById(title)) {
            document.getElementById(title).style.color = 'lightgrey';
        }
        this.setState({ favourites: newArray });
    }

    // Handle input changes in the search bar and hide results if clear button pressed
    onInputChange = (event) => {
        this.setState({ term : event.target.value });
        if (event.target.value.length === 0) {
            this.setState({ hideSearchResults: true });
        }
    }

    // On key press in search bar, only trigger search if Enter pressed
    checkForEnter = (event) => {
        if (event.key === 'Enter') {
            this.wasteSearch();
        }
    }

    // Search Toronto Waste Wizard Database for keywords to match user search, then return results
    wasteSearch = () => {
        this.setState({ searchResults: {}, hideSearchResults: false });
        if (this.state.term){
            const search = this.state.term;
            return fetch('https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000')
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ searchResults: responseJson.filter(function(item) {
                    return item.keywords.includes(search);})
                });
            })
            .catch((error) => {
                console.error(error);
            });
        }
     }

    // Function found on StackOverflow to decode JSON HTML special characters
    decodeHtml = (html) => {
        const text = document.createElement("textarea");
        text.innerHTML = html;
        return text.value;
    }

    // As search results are updated, a table is returned including a favourite button,
    // title, and description for each result. Returns "No search results" otherwise
    renderTable = () => {
        if (this.state.searchResults.length > 0) {
            const resultsArray = Object.entries(this.state.searchResults);
            
            return resultsArray.map((item) => {
                const title = item[1].title;
                const description = this.decodeHtml(item[1].body);

                return (
                    <tr>
                        <td>
                            <button className="favButton" style={{color: 'lightgrey', outline: 'none'}} id={`${title}`} onClick={(event) => this.addToFavourites(title, description)}>&#x2605;</button>
                        </td>
                        <td>{title}</td>
                        <td dangerouslySetInnerHTML={{ __html: description}}></td>
                    </tr>
                );
            });
        }
        else if (this.state.searchResults < 1 && this.state.term) {
            return (
                <div id="noSearchResults"><br/><strong>No search results</strong><br/></div>
            )
        }
    }

    // Renders a table with the current list of favourites displayed and each item's info
    renderFavoritesTable = () => {
        if (this.state.favourites.length > 1) {
            return this.state.favourites.map((item) => {
                const title = item[0];
                const description = this.decodeHtml(item[1]);

                return (
                    <tr>
                        <td>
                            <button id="favRemoveButton" onClick={(event) => this.removeFromFavourites(title, item[1])}>&#x2605;</button>
                        </td>
                        <td>{title}</td>
                        <td dangerouslySetInnerHTML={{ __html: description}}></td>
                    </tr>
                );
            });
        }
    }

   // Renders page with title, search bar, and both tables
    render() {
        return (
        <div>
            <h1 id="title">Toronto Waste Lookup</h1>
            <div className="searchBar">
                <input
                type="search"
                value={this.state.term}
                onChange={this.onInputChange}
                onKeyPress={this.checkForEnter}
                />
                <button id="searchButton" onClick={this.wasteSearch}></button>
            </div>
            <div hidden={this.state.hideSearchResults}>
                <table>
                    <tbody>
                    {this.renderTable()}
                    </tbody>
                </table>
            </div>
            <div><br />
                <div id="favouritesSection" hidden={this.state.favourites.length > 1 ? false : true}>
                    <h2 id="favouritesTitle">Favourites</h2>
                    <table>
                        <tbody>
                        {this.renderFavoritesTable()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        );
    }
}

ReactDOM.render(<App/>, document.querySelector('.container'));
