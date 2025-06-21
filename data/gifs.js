const gifs = [
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWl4eG5zZmJ5cGJoejR6azR2bGxteHdwOWRkb2dkd3JlM2xnYXFsZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5cREBFcGOkC2I/giphy.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3RnZWNrMHNpZWIzZnhsN2x2MzUydng0ZnI3anZqeG1nbTh2MTdiYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/O8HtuXS6zKECI/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXR4YnhxaW5ucWIxdGlsdHV5c3VqaGRob2N3NGN2ODFrbTVwM3hhbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xuVed3MVaZVFm/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDIyMmlrMTFnYXU4aHpuMGthZGRkNTd1ZDVsODNkZDA3cWw0MmUzcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/95MU6SEzeLnUc/giphy.gif",
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWxicWYwZXpueHA1cXlvc2J2YjV0Z3QzdHFjejl3Z3NqaW55dWZweCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ERjZbGusdAxQQ/giphy.gif",
    "https://media.giphy.com/media/BbQrNk32kD064/giphy.gif?cid=ecf05e47aq5iw0sn4pzxl8wnano24t317vxita185vwel8ep&ep=v1_gifs_related&rid=giphy.gif&ct=g",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2k5dzV3NzgzaTcwdXZtdzRvN3kyMGMxejdwdTg2bjM1a2t6N3RzdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qFzHPRyrLuGJFznsL4/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2k5dzV3NzgzaTcwdXZtdzRvN3kyMGMxejdwdTg2bjM1a2t6N3RzdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/QgawLg4F0hJJe/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJmaWgzMHdoajM2bzBpdmU0dTl5NWZpODYzcmhrb2dudnZlbXk1NSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/O8HtuXS6zKECI/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJmaWgzMHdoajM2bzBpdmU0dTl5NWZpODYzcmhrb2dudnZlbXk1NSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/sciQZVz32NBVC/giphy.gif",
];

function getRandomGif() {
    const randomIndex = Math.floor(Math.random() * gifs.length);
    return gifs[randomIndex];
}

module.exports = {
    getRandomGif
}; 