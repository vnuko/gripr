/**
 * @openapi
 * components:
 *   schemas:
 *     RiderInput:
 *       type: object
 *       required:
 *         - riderWeight
 *         - bikeType
 *         - tubeless
 *         - ridingStyle
 *       properties:
 *         riderWeight:
 *           type: number
 *           minimum: 40
 *           maximum: 150
 *           description: Rider weight in kilograms
 *           example: 82
 *         bikeType:
 *           type: string
 *           enum: [trail, enduro, xc, downhill, gravel]
 *           description: Type of bike
 *           example: trail
 *         tireWidth:
 *           type: number
 *           minimum: 1.5
 *           maximum: 3.0
 *           description: Tire width in inches
 *           example: 2.4
 *         tubeless:
 *           type: boolean
 *           description: Whether the tires are tubeless
 *           example: true
 *         ridingStyle:
 *           type: string
 *           enum: [conservative, moderate, aggressive]
 *           description: Rider's riding style
 *           example: aggressive
 *
 *     TerrainFlags:
 *       type: object
 *       properties:
 *         rockyTerrain:
 *           type: boolean
 *           description: Route contains rocky sections
 *         wetRoots:
 *           type: boolean
 *           description: Route has wet root sections
 *         fastFlowTrail:
 *           type: boolean
 *           description: Route is a fast flow trail
 *         longGravelRide:
 *           type: boolean
 *           description: Route is a long gravel ride
 *         technicalDescent:
 *           type: boolean
 *           description: Route has technical descents
 *
 *     RouteMetrics:
 *       type: object
 *       properties:
 *         totalDistance:
 *           type: number
 *           description: Total distance in kilometers
 *         elevationGain:
 *           type: number
 *           description: Total elevation gain in meters
 *         elevationLoss:
 *           type: number
 *           description: Total elevation loss in meters
 *         maxGradient:
 *           type: number
 *           description: Maximum gradient percentage
 *         avgGradient:
 *           type: number
 *           description: Average gradient percentage
 *         difficultyRating:
 *           type: string
 *           enum: [easy, moderate, hard, expert]
 *           description: Estimated route difficulty
 *
 *     PressureRecommendation:
 *       type: object
 *       required:
 *         - frontPsi
 *         - rearPsi
 *       properties:
 *         frontPsi:
 *           type: number
 *           minimum: 12
 *           maximum: 35
 *           description: Front tire pressure in PSI
 *         rearPsi:
 *           type: number
 *           minimum: 15
 *           maximum: 40
 *           description: Rear tire pressure in PSI
 *
 *     AIRecommendation:
 *       type: object
 *       required:
 *         - frontPsi
 *         - rearPsi
 *         - reasoning
 *       properties:
 *         frontPsi:
 *           type: number
 *           description: AI-recommended front tire pressure
 *         rearPsi:
 *           type: number
 *           description: AI-recommended rear tire pressure
 *         reasoning:
 *           type: string
 *           description: AI explanation for the recommendation
 *         confidence:
 *           type: string
 *           enum: [high, medium, low]
 *           description: Confidence level of the recommendation
 *
 *     AnalyzeResponse:
 *       type: object
 *       required:
 *         - baseline
 *         - adjusted
 *         - aiRecommendation
 *       properties:
 *         baseline:
 *           $ref: '#/components/schemas/PressureRecommendation'
 *         adjusted:
 *           $ref: '#/components/schemas/PressureRecommendation'
 *         aiRecommendation:
 *           $ref: '#/components/schemas/AIRecommendation'
 *         routeMetrics:
 *           $ref: '#/components/schemas/RouteMetrics'
 *         terrainFlags:
 *           $ref: '#/components/schemas/TerrainFlags'
 *
 *     Error:
 *       type: object
 *       required:
 *         - error
 *         - message
 *       properties:
 *         error:
 *           type: string
 *           description: Error type
 *         message:
 *           type: string
 *           description: Human-readable error message
 *         statusCode:
 *           type: number
 *           description: HTTP status code
 *         details:
 *           type: object
 *           description: Additional error details
 *
 *     HealthResponse:
 *       type: object
 *       required:
 *         - status
 *         - timestamp
 *       properties:
 *         status:
 *           type: string
 *           enum: [ok, healthy]
 *           description: Health status
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Current server timestamp
 */