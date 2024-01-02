<script lang="ts">

    export let value : string = "";
    export let placeHolder : string;

</script>



<div class="h-min">
    <input type="text" bind:value={value} placeholder={placeHolder} class="p-5 rounded-md border-primary-violet border-2 border-opacity-50  bg-transparent text-primary-white text-md font-semibold outline-none w-fit "/>
</div>