import {AvailableResolutions} from "../constants";

export type VideoType = {
  id: number,
  title: string,
  author: string,
  canBeDownloaded: boolean,
  minAgeRestriction: number | null,
  createdAt: string,
  publicationDate: string,
  availableResolutions: AvailableResolutions[] | null,
}

export type ErrorMessageType = {
  message: string | string[],
  field: string
}

export type ErrorType = {
  errorsMessages: ErrorMessageType[]
}