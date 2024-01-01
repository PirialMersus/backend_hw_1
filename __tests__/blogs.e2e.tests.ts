import request from 'supertest'
import {app} from "../src";
import {HTTP_STATUSES} from "../src/shared/http-statuses";
import {testVideo, testVideo2} from "../src/shared/mock-videos";

describe('/course', () => {
  beforeAll(async () => {
    await request(app).delete('/testing/all-data')
  })

  it('should return 200 and empty array', async () => {
    await request(app)
      .get('/videos')
      .expect(HTTP_STATUSES.OK_200, [])
  })
  it('should return 404 for not existing video', async () => {
    await request(app)
      .get('/videos/1222')
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })
  it(`shouldn't create video with incorrect data`, async () => {
    await request(app)
      .post('/videos')
      .send({title: ''})
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
    await request(app)
      .get('/videos')
      .expect(HTTP_STATUSES.OK_200, [])
  })
  let createdVideo1: any = null;
  it('should create video with correct data', async () => {
    const response = await request(app)
      .post('/videos')
      .send(testVideo)
      .expect(HTTP_STATUSES.CREATED_201)
    createdVideo1 = response.body
    expect(createdVideo1).toEqual({
      ...testVideo,
      id: expect.any(Number),
      createdAt: expect.any(String),
      publicationDate: expect.any(String),
      canBeDownloaded: expect.any(Boolean),
    })
    await request(app)
      .get('/videos')
      .expect(HTTP_STATUSES.OK_200, [createdVideo1])
  })

  let createdVideo2: any = null;
  it('should create one more video with correct data', async () => {
    const response = await request(app)
      .post('/videos')
      .send(testVideo2)
      .expect(HTTP_STATUSES.CREATED_201)

    createdVideo2 = response.body

    expect(createdVideo2).toEqual({
      ...testVideo2,
      id: expect.any(Number),
      createdAt: expect.any(String),
      publicationDate: expect.any(String),
      canBeDownloaded: expect.any(Boolean),
    })

    await request(app)
      .get('/videos')
      .expect(HTTP_STATUSES.OK_200, [createdVideo1, createdVideo2])
  })


  it(`shouldn't update video with incorrect data`, async () => {
    await request(app)
      .put('/videos/' + createdVideo1.id)
      .send({title: ''})
      .expect(HTTP_STATUSES.BAD_REQUEST_400)

    await request(app)
      .get('/videos/' + createdVideo1.id)
      .expect(HTTP_STATUSES.OK_200, createdVideo1)

  })

  it(`shouldn't update video with doesnt exists`, async () => {
    await request(app)
      .put('/videos/' + 2)
      .send(testVideo)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it(`should update video with correct data`, async () => {
    await request(app)
      .put('/videos/' + createdVideo1.id)
      .send(testVideo)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await request(app)
      .get('/videos/' + createdVideo1.id)
      .expect(HTTP_STATUSES.OK_200, {...createdVideo1, publicationDate: testVideo.publicationDate})
  })

  it(`should delete one video`, async () => {
    await request(app)
      .delete(`/videos/${createdVideo1.id}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await request(app)
      .get(`/videos/${createdVideo1.id}` )
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it(`should delete all videos`, async () => {
    await request(app)
      .delete('/testing/all-data')
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await request(app)
      .get('/videos' )
      .expect(HTTP_STATUSES.OK_200, [])

    await request(app)
      .get(`/videos/${createdVideo1.id}` )
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })
})