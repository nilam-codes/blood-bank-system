const getPromise = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("success");
            reject("error");
        }, 5000);
    });
}

let promise = getPromise();
console.log(promise);

promise.then((res) => {
    console.log(res);
});
promise.catch((err) => {
    console.log(err);
});