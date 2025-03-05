<script lang="ts">
    import { onMount } from "svelte";

    let letters = [""];

    let definition = [""];
    let definitionCount = 0;
    let definitionExport: string = "";
    $: definitionExport = definition[definitionCount];

    let statusText: string = "";

    let resetBtn: HTMLButtonElement;

    let score = 0;
    async function getWord() {
        //fetch data from the server (word and definition)
        const response = await fetch("/api/word");
        const data = await response.json();

        //word
        letters = data.word.toUpperCase().split("");

        //definition
        let helpdefinition = data.definition;
        for (let i = 0; i < helpdefinition.length; i++) {
            definition[i] = helpdefinition[i].definition;
        }

        console.log(letters);
        console.log(definition);
    }

    onMount(() => {
        getWord();
    });

    function checkWord(e: Event, index: number) {
        if (statusText) return;
        //check if one letter is correct
        const input = e.target as HTMLInputElement;
        if (input.value.toUpperCase() === letters[index]) {
            input.style.backgroundColor = "green";
            input.readOnly = true;
        } else if (input.value === undefined || input.value === null || input.value === "") {
            input.style.backgroundColor = "transparent";
        } else {
            input.style.backgroundColor = "red";
        }

        //check if all letters are correct
        const inputs = document.querySelectorAll("input");
        const allReadOnly = Array.prototype.every.call(inputs, (input) => {
            return input.readOnly;
        });
        if (allReadOnly) {
            statusText = `Correct! ${letters.join("")}`;
            setTimeout(() => resetBtn.focus(), 100);
            console.log(statusText);
        }

        //input focussing
        if (input.value === "") {
            input.focus();
            e.preventDefault();
        } else if (index >= letters.length - 1) {

        } else {
            let nextInput = document.querySelector(
                `input[data-index="${index + 1}"]`,
            );
            while ((nextInput as HTMLInputElement)?.readOnly) {
                index++;
                nextInput = document.querySelector(
                    `input[data-index="${index + 1}"]`,
                );
                if(index >= letters.length - 1) break;
            }
            (nextInput as HTMLInputElement)?.focus();
        }
    }

    function inputPress(e: KeyboardEvent, index: number) {
        //Bacsspace
        if (e.key === "Backspace") {
            const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
            if(prevInput && (prevInput as HTMLInputElement)?.readOnly === false){ {
                (prevInput as HTMLInputElement)?.focus();
                if (e.target) {
                    (e.target as HTMLInputElement).value = '';
                }
            }}
        }
    }

    function resetForm(){
        (document.getElementById('form') as HTMLFormElement)?.reset();
        statusText = '';
        score++;
        getWord().then(() => {
            const inputs = document.querySelectorAll('input');
            inputs.forEach((input, index) => {
                input.readOnly = false;
                if(index === 0){
                    input.focus();
                }
                input.style.backgroundColor = 'transparent';
            });
        });
    }

    function onHintClick(){
        const randomIndex = Math.floor(Math.random() * letters.length);
        const hintInput = document.querySelector(`input[data-index="${randomIndex}"]`);
        if(hintInput && (hintInput as HTMLInputElement).readOnly){
            onHintClick();
            return;
        }
        const inputs = document.querySelectorAll('input');
        inputs[randomIndex].value = letters[randomIndex];
        const customEvent = new Event('input', { bubbles: true, cancelable: true });
        Object.defineProperty(customEvent, 'target', { value: inputs[randomIndex], enumerable: true });
        checkWord(customEvent, randomIndex);
    }
</script>

<div>
    <h1>Guess the word</h1>
    <div>Your score: {score}</div>
    <button class="btn btn-secondary" onclick="{onHintClick}">Hint 💡</button>
    {#if statusText}
        <div>{statusText}</div>
        <button bind:this={resetBtn} class="btn btn-secondary" onclick={() => resetForm()}>Next word</button>
    {/if}
    <form id="form">
        <div>
            {#if definitionCount > 0}
                <button onclick={() => definitionCount--}>←</button>
            {/if}
            {definitionExport}
            {#if definitionCount < definition.length - 1}
                <button onclick={() => definitionCount++}>→</button>
            {/if}
        </div>
        <div>
            {#each letters as leter, index}
                <input type="text" onkeydown={(e) => inputPress(e, index)} data-index={index} oninput={(e) => checkWord(e, index)} maxlength="1" class="bg-purple-600 text-white border-2 border-white" />
            {/each}
        </div>
    </form>
</div>
