<template>
    <svg class="back-navigation-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M9.4395 20.5606L1.9395 13.0606C1.35375 12.4748 1.35375 11.5253 1.9395 10.9396L9.4395 3.43956C10.0252 2.85381 10.9747 2.85381 11.5605 3.43956C12.1462 4.02531 12.1462 4.97481 11.5605 5.56056L6.621 10.5001H21C21.8287 10.5001 22.5 11.1713 22.5 12.0001C22.5 12.8288 21.8287 13.5001 21 13.5001H6.621L11.5605 18.4396C11.853 18.7321 12 19.1161 12 19.5001C12 19.8841 11.8537 20.2681 11.5605 20.5606C10.9747 21.1463 10.0252 21.1463 9.4395 20.5606Z"
            fill="#001543"
        />
    </svg>
</template>

<style lang="scss" scoped>
.back-navigation-arrow {
    width: 24px;
    height: 24px;
    cursor: pointer;

    &:hover {
        path {
            fill: lighten($color: $colorBlack, $amount: 40);
        }
    }

    &:active {
        path {
            fill: $colorBlack;
        }
    }

    path {
        transition: 0.2s all ease;
    }
}
</style>
