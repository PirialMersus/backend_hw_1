import {VideoType} from "../types";
import {AvailableResolutions} from "../constants";

export let testVideo: VideoType =
  {
    id: 12345,
    title: "Super video 1",
    author: "Gennadii",
    canBeDownloaded: false,
    minAgeRestriction: null,
    createdAt: "2023-07-17T15:50:40.497Z",
    publicationDate: "2023-11-22T12:23:08.880Z",
    availableResolutions: [
      AvailableResolutions.P144
    ]
  }
  export let testVideo2: VideoType =
  {
    id: 12345,
    title: "Super video 2",
    author: "Julia",
    canBeDownloaded: true,
    minAgeRestriction: null,
    createdAt: "2023-07-17T15:50:40.497Z",
    publicationDate: "2023-07-17T15:50:40.497Z",
    availableResolutions: [
      AvailableResolutions.P360
    ]
  }