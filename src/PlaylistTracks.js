import React from "react";

import * as $ from "jquery";

import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";

import Track from "./Track";
import Dropdown from "react-bootstrap/Dropdown";

const electro = ["edm", "electro", "house", "dance", "room", "dubstep", "bass", "trap", "bounce", "brostep"];
const latino = ["latino", "funk", "reggaeton", "hip hop tuga"]

class PlaylistTracks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tracks: [],
      genresSelected: [],
      genresToSelect: [electro, latino],
    };
    this.getAllTracks = this.getAllTracks.bind(this);
  }

  componentDidMount() {
    this.getAllTracks().then(() => {
      this.getAllGenres();
    });
  }

  async getAllTracks() {
    await $.ajax({
      url: this.props.playlist.tracks.href,
      type: "GET",
      headers: {
        Authorization: "Bearer " + this.props.token,
      },
      success: (data) => {
        this.setState({
          tracks: data.items,
        });
      },
    });
  }

  async getAllGenres() {
    var cpt = 0;
    while (cpt < this.state.tracks.length) {
      // var cptD = cpt
      this.setState({
        cptD : cpt
      })
      var requestLink = "https://api.spotify.com/v1/artists?ids=";
      do {
        if(this.state.tracks[cpt].track)
          requestLink += this.state.tracks[cpt].track.artists[0].id + ",";
        cpt++;
      } while (cpt < this.state.tracks.length && cpt % 49 !== 0);
      requestLink = requestLink.slice(0, requestLink.length - 1);

       await $.ajax({
        url: requestLink,
        type: "GET",
        headers: {
          Authorization: "Bearer " + this.props.token,
        },
        success: (data) => { 
          var tracksUpdated = this.state.tracks;
          for (let i = this.state.cptD; i < this.state.cptD + data.artists.length; i++) {
            tracksUpdated[i].track.genres = data.artists[i - this.state.cptD].genres;
          }
          this.setState({
            tracks: tracksUpdated,
          });
        },
      });
    }
  }

  selectGenre = (genre) => {
    this.setState({
      genresSelected: genre, 
    });
  };

  // TODO : Loading
  render() {
    return (
      <div>
        {this.state.genresSelected.length !== 0 ? (
          <div>
            <Button
              onClick={() => this.selectGenre("")}
              className="mb-2"
              variant="danger"
            >
              Deselectionner le genre
            </Button>
            <p> Genre choisi : {this.state.genresSelected[0]}</p>
          </div>
        ) : (
          <div>
            <Dropdown className="mb-2">
              <Dropdown.Toggle variant="success">Selectionner un genre</Dropdown.Toggle>
              <Dropdown.Menu>
                {this.state.genresToSelect.map((genre, index) => {
                  return (
                    <Dropdown.Item
                      onClick={() => this.selectGenre(genre)}
                      key={index}
                    >
                      {genre[0]}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
        <ListGroup>
          {this.state.tracks.map((track) => {
            if (track.track) {
              return (
                <Track
                  key={track.track.id}
                  track={track.track}
                  genresSelected={this.state.genresSelected}
                  selectGenre={this.selectGenre}
                ></Track>
              );
            }
            return null;
          })}
        </ListGroup>
      </div>
    );
  }
}

export default PlaylistTracks;
