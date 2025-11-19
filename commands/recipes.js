const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

await interaction.deferReply();

const RECIPES = {
    'apple-caramel-rolls': {
        name: 'Apple and Caramel Rolls',
        emoji: '🍎',
        image: 'attached_assets/stock_images/apple_caramel_rolls.jpg',
        servings: 'Makes about 24 pieces',
        ingredients: [
            '**Dough:**',
            '• 250 ml milk',
            '• 1 packet instant yeast (7 g)',
            '• 500 g wheat flour',
            '• 50 g sugar',
            '• a pinch of salt',
            '• 1 egg',
            '• 2 egg yolks',
            '• 70 g soft butter',
            '• 1 egg for brushing',
            '',
            '**Filling:**',
            '• 250 g dulce de leche (caramelized milk spread)',
            '• 3 apples (e.g. reinette variety)',
            '',
            '**Cinnamon topping:**',
            '• 2 tablespoons butter',
            '• 7 tablespoons sugar',
            '• 2 teaspoons cinnamon',
            '',
            '**Glaze:**',
            '• 4 tablespoons lemon juice',
            '• about 1/2 cup powdered sugar'
        ],
        instructions: [
            '1. Warm the milk slightly (37–40°C), add yeast, stir, and set aside for 5 minutes.',
            '2. Sift flour into a bowl, add sugar and salt. Make a well, pour in milk with yeast, and stir.',
            '3. Knead the dough, adding egg and yolks. After 5 minutes, add butter and knead for 10–15 minutes until smooth. Cover and let rise for 1½ hours.',
            '4. Prepare apples: peel and dice them. Make cinnamon topping by rubbing butter, sugar, and cinnamon together until crumbly.',
            '5. Roll risen dough into two rectangles (25 x 30 cm). Spread with dulce de leche and sprinkle with apples.',
            '6. Roll up tightly along the long edge, cut each into 12 slices. Arrange in baking pans and let rise for 45 minutes.',
            '7. Preheat oven to 180°C. Brush with egg, sprinkle with cinnamon crumble.',
            '8. Bake for 20 minutes until golden. Drizzle with glaze (warm lemon juice + powdered sugar).'
        ]
    },
    'chalka': {
        name: 'Chałka (Sweet Braided Bread)',
        emoji: '🥖',
        image: 'attached_assets/stock_images/chalka.jpg',
        servings: 'Makes 2 medium challahs',
        ingredients: [
            '**Challah dough:**',
            '• 500 g wheat flour (type 450)',
            '• 250 ml lukewarm milk',
            '• 80 g butter',
            '• 7–8 g dry yeast or 30 g fresh yeast',
            '• 60 g sugar (5 level tablespoons)',
            '• a pinch of salt',
            '',
            '**Crumb topping (Streusel):**',
            '• 50 g wheat flour',
            '• 30 g butter',
            '• 30 g sugar'
        ],
        instructions: [
            '1. Sift flour into bowl, add sugar, salt, and dry yeast. Mix.',
            '2. Add lukewarm milk and melted butter. Mix with spoon, then knead for 10 minutes until smooth.',
            '3. Cover and let rise 1½–2 hours until tripled in volume.',
            '4. Divide dough in half (~460g each). For each challah, divide into 4 equal pieces and roll into 40cm ropes.',
            '5. Braid the four ropes together (or use 3 ropes for traditional braid).',
            '6. Place on parchment-lined tray, let rise 30 minutes. Brush with milk.',
            '7. Make streusel: mix flour, butter, and sugar until crumbly. Sprinkle generously over challahs.',
            '8. Bake at 175°C for 25 minutes until golden brown.'
        ]
    },
    'cheese-star': {
        name: 'Cheese Star',
        emoji: '⭐',
        image: 'attached_assets/stock_images/cheese_star.jpg',
        servings: 'Makes 1 large star pastry',
        ingredients: [
            '**Yeast dough:**',
            '• 500 g wheat flour',
            '• 14 g instant yeast (2 packets) or 50 g fresh yeast',
            '• 50 g sugar',
            '• 200 ml milk',
            '• 2 eggs',
            '• 50 g butter',
            '',
            '**Filling:**',
            '• 300 g curd cheese (quark)',
            '• 1 egg',
            '• 1 packet vanilla sugar',
            '• 50 g sugar',
            '• 40 g butter',
            '• optional: 50 g candied orange peel',
            '',
            '**Also:**',
            '• 1 egg for brushing',
            '• powdered sugar for dusting or glaze'
        ],
        instructions: [
            '1. Mix flour with yeast, milk, and sugar. Add eggs and mix, then add butter. Knead 15 minutes until smooth. Let rise 45 minutes.',
            '2. Make filling: Mix curd cheese, egg, vanilla sugar, sugar, and butter for 1 minute. Optionally add candied orange peel.',
            '3. Divide dough into 4 equal parts. Roll first piece into 25cm circle, place on parchment.',
            '4. Spread 1/3 of cheese filling, leaving 1cm border. Add second dough circle, more filling, third circle, filling, and top with fourth circle.',
            '5. Cut into 16 sections (don\'t cut to center). Twist each section twice, alternating directions. Pinch ends of pairs together.',
            '6. Let rise 20 minutes. Preheat oven to 180°C.',
            '7. Brush with beaten egg. Bake 25 minutes until golden.',
            '8. Cool slightly, dust with powdered sugar or drizzle with glaze.'
        ]
    },
    'cheesecake-blueberry': {
        name: 'Cheesecake with Blueberries',
        emoji: '🫐',
        image: 'attached_assets/stock_images/blueberry_cheesecake.jpg',
        servings: '21 cm springform pan',
        ingredients: [
            '**Crust:**',
            '• 170 g tea biscuits',
            '• 70–80 g melted butter',
            '',
            '**Cheesecake filling:**',
            '• 350 g white chocolate',
            '• 200 ml heavy cream (36%)',
            '• 200 g cheesecake cheese',
            '• 500 g mascarpone cheese',
            '• 1 packet vanilla sugar',
            '• 1 packet whipped cream stabilizer',
            '• 200 g blueberries',
            '',
            '**Topping:**',
            '• 300 ml chilled heavy cream',
            '• 1 tablespoon powdered sugar',
            '• 1 teaspoon whipped cream stabilizer',
            '• 1 teaspoon vanilla extract',
            '• 80–100 g blueberries for garnish'
        ],
        instructions: [
            '1. Blend biscuits into crumbs, mix with melted butter. Press into 21cm springform pan.',
            '2. Boil cream, pour over white chocolate, stir until melted. Let cool completely.',
            '3. Blend blueberries into purée.',
            '4. Mix mascarpone, cheesecake cheese, vanilla sugar, and stabilizer. Gradually add cooled chocolate.',
            '5. Spread 1/3 of mixture over crust. Freeze 8–10 minutes.',
            '6. Divide remaining mixture in half. Add 2 tbsp blueberry purée to one half, rest to the other.',
            '7. Spread lighter blueberry layer, freeze 10 minutes. Spread darker layer on top.',
            '8. Refrigerate overnight.',
            '9. Remove from pan. Whip cream with powdered sugar, stabilizer, and vanilla. Spread on top and decorate with blueberries.'
        ]
    },
    'cinnamon-rolls': {
        name: 'Cinnamon Rolls',
        emoji: '🥐',
        image: 'attached_assets/stock_images/cinnamon_rolls.jpg',
        servings: 'Makes about 12 rolls',
        ingredients: [
            '**Dough:**',
            '• 180 ml milk (3/4 cup)',
            '• 50 g sugar (1/4 cup)',
            '• 50 g butter (1/4 cup)',
            '• 7 g dry yeast or 15 g fresh',
            '• 1 egg',
            '• 360 g flour',
            '• 1/2 teaspoon salt',
            '',
            '**Filling:**',
            '• 50 g butter (room temperature)',
            '• 70 g brown sugar (1/3 cup)',
            '• 2 teaspoons cinnamon',
            '',
            '**Frosting (optional):**',
            '• 25 g cream cheese (1 heaping tablespoon)',
            '• 20 g heavy cream (2 tablespoons)',
            '• 50 g powdered sugar (1/2 cup)'
        ],
        instructions: [
            '1. Heat milk, butter, and sugar until dissolved. Cool to warm (not hot), add yeast. Set aside 10–15 minutes.',
            '2. Add egg and mix. Gradually add flour and salt, mixing with dough hook until smooth. Cover and let rise 1 hour.',
            '3. Roll dough into rectangle (30 x 40 cm). Cream together butter, sugar, and cinnamon. Spread evenly over dough.',
            '4. Roll up tightly along shorter side. Cut into 3cm slices, place flat in baking pan.',
            '5. Let rise 30 minutes until doubled. Preheat oven to 180°C.',
            '6. Make frosting: mix cream cheese, heavy cream, and powdered sugar.',
            '7. Bake 17–19 minutes until golden brown.',
            '8. Glaze while still warm to keep fresh longer.'
        ]
    },
    'peach-cheesecake': {
        name: 'Peach Cheesecake',
        emoji: '🍑',
        image: 'attached_assets/stock_images/peach_cheesecake.jpg',
        servings: 'Serves 10-12',
        ingredients: [
            '**Crust:**',
            '• 350 g tea biscuits (crushed)',
            '• 150 g butter (melted)',
            '',
            '**Filling:**',
            '• 750 g curd cheese (triple-ground)',
            '• 200 g white sugar (or to taste)',
            '• 1/2 teaspoon grated lemon zest (optional)',
            '• 1 tablespoon fresh lemon juice',
            '• 1 tablespoon vanilla extract',
            '• 1/4 teaspoon salt',
            '• 420 g heavy cream (35%, cold)',
            '',
            '**Peach topping:**',
            '• 50 g butter',
            '• 3 large peaches (peeled and sliced)',
            '• 50 g white sugar',
            '• 1 tablespoon brandy or cognac',
            '• a pinch of salt'
        ],
        instructions: [
            '1. Mix crushed biscuits with melted butter. Press into springform pan to form crust.',
            '2. Beat curd cheese with sugar, lemon zest, lemon juice, vanilla, and salt until smooth.',
            '3. Whip cold heavy cream until stiff peaks. Fold into cheese mixture.',
            '4. Pour filling over crust, smooth top. Refrigerate 4–6 hours or overnight.',
            '5. For topping: melt butter in pan, add sliced peaches, sugar, and salt. Cook until caramelized.',
            '6. Add brandy/cognac, cook 1 more minute. Let cool.',
            '7. Arrange peaches on top of chilled cheesecake before serving.'
        ]
    },
    'strawberry-cream-cake': {
        name: 'Strawberries and Cream Cake',
        emoji: '🍓',
        image: 'attached_assets/stock_images/strawberry_cake.jpg',
        servings: '26 cm (10 inch) cake',
        ingredients: [
            '**Sponge cake:**',
            '• 6 eggs (size M), room temperature',
            '• 120 g wheat flour (3/4 cup)',
            '• 120 g cornstarch or potato starch (3/4 cup)',
            '• 200 g sugar (1 cup)',
            '• 2 tablespoons water',
            '',
            '**Strawberry cream:**',
            '• 500 g strawberries',
            '• 500 g whipping cream (30–36%), chilled',
            '• 80 g sugar',
            '• 4 level teaspoons powdered gelatin',
            '',
            '**Additional:**',
            '• 340 g strawberry jam (8 heaping tablespoons)',
            '• 400 g whipping cream (30–36%), chilled',
            '• 1 tablespoon powdered sugar',
            '• whipped cream stabilizer (optional)',
            '• fresh strawberries for garnish'
        ],
        instructions: [
            '1. Sponge: Mix flour and starch, sift. Beat egg whites to stiff peaks, gradually add sugar. Add yolks one at a time. Fold in flour mixture and water.',
            '2. Bake in 26cm springform at 180°C for 30 minutes. Cool upside down, then cut into 3 layers.',
            '3. Strawberry cream: Blend strawberries with sugar. Bloom gelatin in 4 tbsp water, heat until dissolved. Mix into strawberry purée.',
            '4. Chill until slightly thickened. Whip cream, fold into strawberry mixture.',
            '5. Place first layer on platter, fasten tall ring around it. Spread 4 tbsp jam, then 1/3 strawberry cream.',
            '6. Add second layer, 4 tbsp jam, half remaining cream. Add third layer, remaining cream.',
            '7. Refrigerate overnight.',
            '8. Whip remaining cream with powdered sugar. Pipe decoration, garnish with fresh strawberries.',
            '9. Store in refrigerator up to 3–4 days.'
        ]
    }
};

module.exports = {
    name: 'recipes',
    description: 'View delicious baking recipes with ingredients and instructions!',

    data: new SlashCommandBuilder()
        .setName('recipes')
        .setDescription('View delicious baking recipes!')
        .addStringOption(option =>
            option.setName('recipe')
                .setDescription('Choose a recipe')
                .setRequired(true)
                .addChoices(
                    { name: '🍎 Apple and Caramel Rolls', value: 'apple-caramel-rolls' },
                    { name: '🥖 Chałka (Sweet Braided Bread)', value: 'chalka' },
                    { name: '⭐ Cheese Star', value: 'cheese-star' },
                    { name: '🫐 Cheesecake with Blueberries', value: 'cheesecake-blueberry' },
                    { name: '🥐 Cinnamon Rolls', value: 'cinnamon-rolls' },
                    { name: '🍑 Peach Cheesecake', value: 'peach-cheesecake' },
                    { name: '🍓 Strawberries and Cream Cake', value: 'strawberry-cream-cake' }
                )
        ),

    async execute(interaction) {
        const recipeChoice = interaction.options.getString('recipe');
        const recipe = RECIPES[recipeChoice];

        if (!recipe) {
            return interaction.reply({
                content: '❌ Recipe not found!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${recipe.emoji} ${recipe.name}`)
            .setColor('#ff69b4')
            .setDescription(`*${recipe.servings}*\n\n**Ingredients:**\n${recipe.ingredients.join('\n')}\n\n**Instructions:**\n${recipe.instructions.join('\n\n')}`)
            .setFooter({ text: 'Happy baking! 🧁' })
            .setTimestamp();

        // Try to attach image if it exists
        try {
            const fs = require('fs');
            if (fs.existsSync(recipe.image)) {
                embed.setImage(`attachment://${recipe.image.split('/').pop()}`);
                const attachment = new AttachmentBuilder(recipe.image);
                return interaction.reply({ embeds: [embed], files: [attachment] });
            }
        } catch (error) {
            // If image doesn't exist, just send without it
            console.log(`Image not found for ${recipe.name}, sending without image`);
        }

        return interaction.reply({ embeds: [embed] });
    }
};
