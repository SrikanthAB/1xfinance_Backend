
import { Router } from 'express'
import ReviewController from '../../controllers/user/review.controller'
import { validateRequest } from '../../middleware/validateRequest'
import authenticateUser from '../../middleware/auth.middleware'
import { queryValidation,createReviewValidation,paramValidation,updateReviewValidation } from '../../validations/user/review.validation'

export class ReviewRoutes {
  router: Router
  public review = ReviewController

  constructor() {
    this.router = Router()
    this.routes()
  }
  routes() {
    this.router.post('/',validateRequest(queryValidation,{target:'query'}),validateRequest(createReviewValidation),authenticateUser,this.review.createReview)
    this.router.get('/:id',validateRequest(paramValidation,{target:'params'}),authenticateUser,this.review.getReviewById)
    // this.router.get('/', this.review.findAllReviews)
    this.router.put('/:id',validateRequest(paramValidation,{target:'params'}),validateRequest(updateReviewValidation),authenticateUser, this.review.updateReview)
    this.router.delete('/:id',validateRequest(paramValidation,{target:'params'}),authenticateUser, this.review.deleteReview)
  }
}

