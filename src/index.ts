import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "./shared/http-statuses";
import {ErrorType, VideoType} from "./types";
import {AvailableResolutions} from "./constants";

type RequestWithParams<P> = Request<P, {}, {}, {}>
type RequestWithBody<B> = Request<{}, {}, B, {}>



export let videos: VideoType[] = [
  {
    id: 110,
    title: "some title",
    author: "some author",
    canBeDownloaded: true,
    minAgeRestriction: null,
    createdAt: "2023-07-17T15:50:40.497Z",
    publicationDate: "2023-07-17T15:50:40.497Z",
    availableResolutions: [
      AvailableResolutions.P144
    ]
  }
]

export const app = express()
const port = process.env.PORT || 3022

app.use(express.json())

app.get('/videos', (req: Request, res: Response) => {
  res.send(videos).status(HTTP_STATUSES.OK_200)
})

app.get('/videos/:id', (req: RequestWithParams<{ id: number }>, res: Response) => {
  const id = +req.params.id
  const foundVideo = videos.find(video => video.id === id)

  if (foundVideo) {
    res.send(foundVideo).status(HTTP_STATUSES.NO_CONTENT_204)
    return
  }

  res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
})

app.delete('/testing/all-data', (req: Request, res: Response) => {
  videos.length = 0

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.delete('/videos/:id', (req: RequestWithParams<{ id: number }>, res: Response) => {
  const id = +req.params.id
  let foundVideoExist = false

  const filteredVideos = videos.filter(video => {
    if (video.id === id) {
      foundVideoExist = true
    }
    return video.id !== id
  })
  if (foundVideoExist) {
    videos = filteredVideos
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    return
  }
  res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
})

app.post('/videos', (req: RequestWithBody<{
  title: string,
  author: string,
  availableResolutions: AvailableResolutions[]
}>, res: Response) => {
  let errors: ErrorType = {
    errorsMessages: []
  }
  let {title, author, availableResolutions} = req.body

  if (!title || !title.length || title.trim().length > 40) {
    errors.errorsMessages.push({message: 'Invalid title', field: 'title'})
  }

  if (!author || !author.length || author.trim().length > 20) {
    errors.errorsMessages.push({message: 'Invalid author', field: 'author'})
  }
  if (Array.isArray(availableResolutions)) {
    availableResolutions.map(r => {
      !AvailableResolutions[r] && errors.errorsMessages.push({
        message: 'Invalid availableResolutions',
        field: 'availableResolutions'
      })
    })
  } else {
    availableResolutions = []
  }
  if (errors.errorsMessages.length) {
    res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors)
    return
  }

  const createdAt = new Date()
  const publicationAT = new Date()
  publicationAT.setDate(createdAt.getDate() + 1)

  const newVideo: VideoType = {
    id: +(new Date()),
    canBeDownloaded: false,
    minAgeRestriction: null,
    createdAt: createdAt.toISOString(),
    publicationDate: publicationAT.toISOString(),
    title,
    author,
    availableResolutions
  }

  videos.push(newVideo)

  res.status(HTTP_STATUSES.CREATED_201).send(newVideo)
})

app.put('/videos/:id', (req: RequestWithParams<{ id: number }> & RequestWithBody<{
  title: string,
  author: string,
  availableResolutions: AvailableResolutions[],
  canBeDownloaded: boolean,
  minAgeRestriction: number,
  publicationDate: string,
  createdAt: string,
}>, res: Response) => {
  let errors: ErrorType = {
    errorsMessages: []
  }
  const id = +req.params.id
  const {
    title,
    author,
    availableResolutions,
    canBeDownloaded,
    minAgeRestriction,
    publicationDate,
    // createdAt
  } = req.body ?? {};


  const availableResolutionsExists = Array.isArray(availableResolutions)
  const date = publicationDate ? new Date(publicationDate).toISOString() : undefined
  if (publicationDate !== 'undefined' && date !== publicationDate) {
    errors.errorsMessages.push({message: 'Invalid publicationDate', field: 'publicationDate'});
  }
  if (typeof canBeDownloaded !== "undefined" && typeof canBeDownloaded !== "boolean") {
    errors.errorsMessages.push({message: 'Invalid canBeDownloaded', field: 'canBeDownloaded'});
  }

  if (!!minAgeRestriction && (isNaN(+minAgeRestriction) || minAgeRestriction < 1 || minAgeRestriction > 18)) {
    errors.errorsMessages.push({message: 'Invalid minAgeRestriction', field: 'minAgeRestriction'});
  }

  if (!title || !title.length || title.trim().length > 40) {
    errors.errorsMessages.push({message: 'Invalid title', field: 'title'})
  }

  if (!author || !author.length || author.trim().length > 20) {
    errors.errorsMessages.push({message: 'Invalid author', field: 'author'})
  }
  if (availableResolutionsExists) {
    availableResolutions.map(r => {
      !AvailableResolutions[r] && errors.errorsMessages.push({
        message: 'Invalid availableResolutions',
        field: 'availableResolutions'
      })
    })
  }
  if (errors.errorsMessages.length) {
    res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors)
    return;
  }

  const foundVideo = videos.find(video => video.id === id)
  if (foundVideo) {
    if (canBeDownloaded) {
      foundVideo.canBeDownloaded = canBeDownloaded ? Boolean(canBeDownloaded) : false
    }
    if (minAgeRestriction) {
      foundVideo.minAgeRestriction = +minAgeRestriction || null
    }
    if (availableResolutionsExists) {
      foundVideo.availableResolutions = availableResolutions || null
    }
    foundVideo.title = title;
    foundVideo.author = author;
    foundVideo.publicationDate = publicationDate;
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  } else {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
