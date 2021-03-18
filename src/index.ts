import { PORT, app } from './app';
import { logger } from '../winston'

// Start server
app.listen(PORT, () => logger.info(`Server is listening on port ${PORT}!`));
