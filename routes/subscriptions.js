/**
 * Subscription CRUD routes
 * @author Shuja Naqvi
 */
const router = require('express').Router();
const { validateSubscription, isValidated } = require('../middlewares/validators');
const subscription = require('../controllers/subscription');

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post subscription create
 * @method get get-All subscriptions
 * @method get get subscription by id
 * @method get get subscription by userId
 */

router.post('/', validateSubscription, isValidated, subscription.create);
router.get('/', subscription.getAll);
router.get('/getByUser', subscription.getByUser);
router.get('/packageSubscriber/:packageId', subscription.packageSubscriber);
router.get('/:subscriptionId', subscription.getById);

// Export
module.exports = router;
