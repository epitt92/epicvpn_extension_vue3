<template>
    <div :class="['status']" :style="style">
        {{ statusString }}
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { capitalizeFirstLetter } from '@/helpers/mixins.js';

const props = defineProps({
    status: {
        type: String,
        default: 'active',
    },
    activeStyles: {
        type: Object,
        default: () => {
            return {
                color: '#fff',
                background: '#3fca45',
            };
        },
    },
    pausedStyles: {
        type: Object,
        default: () => {
            return {
                color: '#fff',
                background: '#ff9800',
            };
        },
    },
    canceledStyles: {
        type: Object,
        default: () => {
            return {
                color: '#fff',
                background: '#f44336',
            };
        },
    },
    expiredStyles: {
        type: Object,
        default: () => {
            return {
                color: '#fff',
                background: '#f44336',
            };
        },
    },
    failedStyles: {
        type: Object,
        default: () => {
            return {
                color: '#fff',
                background: '#f44336',
            };
        },
    },
    refundedStyles: {
        type: Object,
        default: () => {
            return {
                color: '#fff',
                background: '#f44336',
            };
        },
    },
    approvalPendingStyles: {
        type: Object,
        default: () => {
            return {
                color: '#fff',
                background: '#ffc107',
            };
        },
    },
});

const statusString = computed(() => {
    let newStatus = props.status;
    if (props.status === 'approval_pending') {
        newStatus = 'Pending approval';
    }
    return capitalizeFirstLetter(newStatus).split('_').join(' ');
});

const style = computed(() => {
    switch (String(props.status).toLowerCase().split(' ').join('-')) {
        case 'active':
            return props.activeStyles;
        case 'paused':
            return props.pausedStyles;
        case 'canceled':
            return props.canceledStyles;
        case 'expired':
            return props.expiredStyles;
        case 'failed':
            return props.failedStyles;
        case 'inactive':
            return props.failedStyles;
        case 'refunded':
            return props.refundedStyles;
        case 'approval_pending':
            return props.approvalPendingStyles;
        default:
            return {
                background: '#ebeff7',
                color: '#8898b2',
            };
    }
});
</script>

<style lang="scss" scoped>
.status {
    padding: 0 6px;
    line-height: 1;
    font-size: 12px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
}
</style>
