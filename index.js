import _ from 'lodash';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// TODO: Comments, Lint Errors, Star buttons, Star button colours, 
// search on enter, host, Unit tests?

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
            }
            return (item[0] !== title && item[1] !== description)
        });
        if (favourite) {
            newArray.push([title, description]);
        };
        this.setState({ favourites: newArray });
    }

    removeFromFavourites = (title, description) => {
        const array = this.state.favourites;
        const newArray = array.filter((item) => {
            return (item[0] !== title && item[1] !== description)
        });
        this.setState({ favourites: newArray });
    }

    onInputChange = (event) => {
        this.setState({ term : event.target.value });
        if (event.target.value.length === 0) {
            this.setState({ hideSearchResults: true });
        }
    }

    clearTable = () => {
        if (this.state.term === ''){
            this.setState({ searchResults: {} });
        }
    }

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

    decodeHtml = (html) => {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    renderTable = () => {
        if (this.state.searchResults.length > 0) {
            const resultsArray = Object.entries(this.state.searchResults);
            
            return resultsArray.map((item) => {
                const title = item[1].title;
                const description = this.decodeHtml(item[1].body);

                return (
                    <tr>
                        <td>
                            <button id="favButton" onClick={(event) => this.addToFavourites(title, description)}>Star</button>
                        </td>
                        <td>{title}</td>
                        <td dangerouslySetInnerHTML={{ __html: description}}></td>
                    </tr>
                );
            });
        }
        else if (this.state.searchResults < 1 && this.state.term) {
            return (
                <div id="noSearchResults"><br/>No search results<br/></div>
            )
        }
    }

    renderFavoritesTable = () => {
        if (this.state.favourites.length > 1) {
            return this.state.favourites.map((item) => {
                const title = item[0];
                const description = this.decodeHtml(item[1]);

                return (
                    <tr>
                        <td>
                            <button id="favRemoveButton" onClick={(event) => this.removeFromFavourites(title, item[1])}>Star</button>
                        </td>
                        <td>{title}</td>
                        <td dangerouslySetInnerHTML={{ __html: description}}></td>
                    </tr>
                );
            });
        }
    }

    render() {
        return (
        <div>
            <h1 id="title">Toronto Waste Lookup</h1>
            <div className="searchBar">
                <input
                type="search"
                value={this.state.term}
                onChange={this.onInputChange}
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
                <div hidden={this.state.favourites.length > 1 ? false : true}>
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