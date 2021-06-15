FROM public.ecr.aws/lambda/nodejs:14



ARG FUNCTION_DIR="/var/task"

# Install nodejs dependencies, and create user (to run chromium from non-root user)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN npm install chrome-aws-lambda puppeteer@8.0.0

COPY app.js ${FUNCTION_DIR}
CMD ["app.handler"]