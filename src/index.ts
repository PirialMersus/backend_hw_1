import express, {Request, Response} from "express";

enum AvailableResolutions {
  P144 = 'P144',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160'
}

type RequestWithParams<P> = Request<P, {}, {}, {}>
type RequestWithBody<B> = Request<{}, {}, B, {}>

type VideoType = {
  id: number,
  title: string,
  author: string,
  canBeDownloaded: boolean,
  minAgeRestriction: number | null,
  createdAt: string,
  publicationDate: string,
  availableResolutions: AvailableResolutions[] | null,
}

type ErrorMessageType = {
  message: string,
  field: string
}

type ErrorType = {
  errorMessages: ErrorMessageType[]
}

let videos: VideoType[] = [
  // {
  //   id: 0,
  //   title: "string",
  //   author: "string",
  //   canBeDownloaded: true,
  //   minAgeRestriction: null,
  //   createdAt: "2023-07-17T15:50:40.497Z",
  //   publicationDate: "2023-07-17T15:50:40.497Z",
  //   availableResolutions: [
  //     AvailableResolutions.P144
  //   ]
  // }
]

const app = express()
const port = 3000

app.use(express.json())

app.get('/videos', (req: Request, res: Response) => {
  res.send(videos)
})

app.get('/videos/:id', (req: RequestWithParams<{ id: number }>, res: Response) => {
  const id = +req.params.id
  const foundVideo = videos.find(video => video.id === id)

  if (foundVideo) {
    res.send(foundVideo).status(204)
    return
  }

  res.sendStatus(404)
})
app.delete('/testing/all-data', (req: Request, res: Response) => {
  videos.length = 0

  res.sendStatus(204)
})

app.delete('/videos/:id', (req: RequestWithParams<{ id: number }>, res: Response) => {
  const id = +req.params.id
  let foundVideoExist = false

  const filteredVideos = videos.filter(video => {
    if (video.id !== id) {
      foundVideoExist = true
    }
    return video.id !== id
  })
  if (foundVideoExist) {
    videos = filteredVideos
    res.sendStatus(204)
    return
  }
  res.sendStatus(404)
})


app.post('/videos', (req: RequestWithBody<{
  title: string,
  author: string,
  availableResolutions: AvailableResolutions[]
}>, res: Response) => {
  let errors: ErrorType = {
    errorMessages: []
  }
  let {title, author, availableResolutions} = req.body

  if (!title || !title.length || title.trim().length > 40) {
    errors.errorMessages.push({message: 'Invalid title', field: 'title'})
  }

  if (!author || !author.length || author.trim().length > 20) {
    errors.errorMessages.push({message: 'Invalid author', field: 'author'})
  }
  if (Array.isArray(availableResolutions)) {
    availableResolutions.map(r => {
      !AvailableResolutions[r] && errors.errorMessages.push({
        message: 'Invalid availableResolutions',
        field: 'availableResolutions'
      })
    })
  } else {
    availableResolutions = []
  }
  if (errors.errorMessages.length) {
    res.status(400).send(errors)
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

  res.status(201).send(newVideo)
})
app.put('/videos/:id', (req: RequestWithParams<{ id: number }> & RequestWithBody<{
  title: string,
  author: string,
  availableResolutions: AvailableResolutions[],
  canBeDownloaded: boolean,
  minAgeRestriction: string,
  publicationDate: string,
}>, res: Response) => {
  let errors: ErrorType = {
    errorMessages: []
  }
  const id = +req.params.id
  console.log('id ', id)
  let {title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate} = req.body
  const availableResolutionsExists = Array.isArray(availableResolutions)
  const minAgeRestrictionValue = minAgeRestriction?.trim() ?? '';

  if (publicationDate && isNaN(Date.parse(publicationDate))) {
    errors.errorMessages.push({message: 'Invalid publicationDate', field: 'publicationDate'});
  }
  console.log('minAgeRestriction ', minAgeRestriction)

  if (!!minAgeRestrictionValue && (isNaN(+minAgeRestrictionValue) || minAgeRestrictionValue.length < 1 || minAgeRestrictionValue.length > 18)) {
    errors.errorMessages.push({message: 'Invalid minAgeRestriction', field: 'minAgeRestriction'});
  }

  if (!title || !title.length || title.trim().length > 40) {
    errors.errorMessages.push({message: 'Invalid title', field: 'title'})
  }

  if (!author || !author.length || author.trim().length > 20) {
    errors.errorMessages.push({message: 'Invalid author', field: 'author'})
  }
  if (availableResolutionsExists) {
    availableResolutions.map(r => {
      !AvailableResolutions[r] && errors.errorMessages.push({
        message: 'Invalid availableResolutions',
        field: 'availableResolutions'
      })
    })
  }
  if (errors.errorMessages.length) {
    res.status(400).send(errors)
    return;
  }

  const foundVideo = videos.find(video => video.id === id)
  if (foundVideo) {
    if (canBeDownloaded) {
      foundVideo.canBeDownloaded = canBeDownloaded
    }
    if (minAgeRestriction) {
      foundVideo.minAgeRestriction = +minAgeRestriction || null
    }
    if (availableResolutionsExists) {
      foundVideo.availableResolutions = availableResolutions || null
    }
    foundVideo.title = title;
    foundVideo.minAgeRestriction = +minAgeRestriction || null;
    foundVideo.author = author;
    foundVideo.publicationDate = publicationDate;
    res.sendStatus(204);
  } else {
    res.sendStatus(404);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})